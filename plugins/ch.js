import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import { cmd } from '../command.js';
import {
    proto, // <-- Imported proto directly
    generateWAMessageContent,
    generateMessageIDV2,
    normalizeMessageContent
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

// ==================== HELPER: BASE64 ENCODER ====================
const encodeBase64EncodedStringForUpload = (b64) => 
    encodeURIComponent(b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, ''));

// ==================== HELPER: VOICE CONVERTER (FFMPEG) ====================
async function convertToVoiceNote(inputBuffer) {
    return new Promise((resolve, reject) => {
        const inp = new PassThrough(); inp.end(inputBuffer);
        const out = new PassThrough();
        const chunks = [];
        out.on('data', c => chunks.push(c));
        out.on('end', () => resolve(Buffer.concat(chunks)));
        out.on('error', reject);
        ffmpeg(inp)
            .audioCodec('libopus')
            .audioChannels(1)
            .audioFrequency(24000)
            .format('ogg')
            .outputOptions(['-b:a 32k'])
            .on('error', reject)
            .pipe(out, { end: true });
    });
}

// ==================== HELPER: RESOLVE CHANNEL LINK ====================
async function resolveChannelLink(client, link) {
    const m = link.match(/whatsapp\.com\/channel\/([\w-]+)/i);
    if (!m) return null;
    try {
        const metadata = await client.newsletterMetadata("invite", m[1]);
        return metadata?.id || null;
    } catch { return null; }
}

// ==================== HELPER: CUSTOM UPLOAD TO NEWSLETTER ====================
async function uploadToNewsletter(client, buffer, mediaType) {
    const result = await client.query({
        tag: 'iq',
        attrs: { type: 'set', xmlns: 'w:m', to: 's.whatsapp.net' },
        content: [{ tag: 'media_conn', attrs: {} }]
    });
    
    const mediaConn = result.content.find(n => n.tag === 'media_conn');
    const auth = mediaConn.attrs.auth;
    const hostname = mediaConn.content.find(n => n.tag === 'host').attrs.hostname;

    const fileSha256 = crypto.createHash('sha256').update(buffer).digest();
    const fileEncSha256B64 = encodeBase64EncodedStringForUpload(fileSha256.toString('base64'));

    const mediaPathMap = {
        image: '/newsletter/newsletter-image',
        video: '/newsletter/newsletter-video',
        audio: '/newsletter/newsletter-ptt'
    };
    
    const mediaPath = mediaPathMap[mediaType] || '/newsletter/newsletter-audio';
    const serverThumb = '&server_thumb_gen=1'; 
    const url = `https://${hostname}${mediaPath}/${fileEncSha256B64}?auth=${encodeURIComponent(auth)}&token=${fileEncSha256B64}${serverThumb}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/octet-stream', 
            'Origin': 'https://web.whatsapp.com' 
        },
        body: buffer
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const json = await res.json();

    return {
        directPath: json.direct_path,
        fileSha256,
        fileLength: buffer.length,
        mimetype: mediaType === 'audio' ? 'audio/ogg; codecs=opus' : 'application/octet-stream'
    };
}

// ==================== CHANNEL STATUS COMMAND ====================
cmd({
    pattern: "channelstatus",
    alias: ["cs", "newsstatus"],
    react: '📢',
    desc: "Post a 24-hour status to a WhatsApp Channel (Newsletter) with media, voice, or text",
    category: "owner",
    filename: __filename
}, async (client, message, m, { from, isCreator, text, reply }) => {
    try {
        if (!isCreator) {
            return await reply("*📛 This is an owner command.*");
        }

        const args = text.split(' ');
        let channelInput = args[0];
        const statusText = args.slice(1).join(' ');

        if (!channelInput) {
            return await reply("⚠️ *Usage:*\n`.cs <channel_link_or_jid> <text>`\n\n*Example:*\n`.cs https://whatsapp.com/channel/xxxx Hello followers!`\n\n_Reply to an image/video/voice to post a media status._");
        }

        // 1. Resolve Channel Link to JID
        let channelJid = channelInput;
        if (channelInput.includes('whatsapp.com/channel/')) {
            await reply("🔍 Resolving channel link...");
            const resolved = await resolveChannelLink(client, channelInput);
            if (!resolved) return await reply("❌ Could not resolve that channel link. Make sure the link is valid.");
            channelJid = resolved;
        }

        if (!channelJid.endsWith('@newsletter')) {
            return await reply("❌ Invalid channel JID. It must end with `@newsletter`.");
        }

        let finalContent = {};

        // ==================== HANDLE MEDIA ====================
        if (m.quoted && m.quoted.mtype) {
            let buffer = await m.quoted.download();
            if (!buffer) return await reply("❌ Failed to download media.");

            const mtype = m.quoted.mtype;
            
            let mediaType = null;
            if (mtype === 'imageMessage') mediaType = 'image';
            else if (mtype === 'videoMessage') mediaType = 'video';
            else if (mtype === 'audioMessage') mediaType = 'audio';
            else return await reply("❌ Only Image, Video, and Audio/Voice statuses are supported.");

            // If it's audio, convert to a proper WhatsApp Voice Note using ffmpeg
            if (mediaType === 'audio') {
                await reply("🎙️ Converting audio to Voice Note...");
                try {
                    buffer = await convertToVoiceNote(buffer);
                } catch (e) {
                    console.warn("FFmpeg conversion failed, using original audio:", e.message);
                }
            }

            await reply(`⏳ Uploading ${mediaType} to WhatsApp servers...`);
            const uploaded = await uploadToNewsletter(client, buffer, mediaType);

            if (mediaType === 'audio') {
                finalContent = {
                    audioMessage: {
                        directPath: uploaded.directPath,
                        fileSha256: uploaded.fileSha256,
                        fileLength: uploaded.fileLength,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true,
                        seconds: m.quoted.message?.audioMessage?.seconds || 0
                    }
                };
            } else {
                const qMsg = m.quoted.message?.[mtype] || {};
                finalContent = {
                    [mtype]: {
                        ...qMsg,
                        directPath: uploaded.directPath,
                        fileSha256: uploaded.fileSha256,
                        fileLength: uploaded.fileLength,
                        caption: statusText || qMsg.caption || "",
                        url: undefined,
                        mediaKey: undefined,
                        fileEncSha256: undefined,
                        mediaKeyTimestamp: undefined
                    }
                };
            }
        } 
        // ==================== HANDLE TEXT ====================
        else if (statusText) {
            const inner = await generateWAMessageContent({ text: statusText }, { upload: client.waUploadToServer });
            finalContent = inner;
        } 
        else {
            return await reply("⚠️ Please provide text or reply to an image/video/voice.");
        }

        // 2. Build the special <status> stanza
        await reply("⏳ Posting status to channel...");
        
        const id = generateMessageIDV2(client.user?.id);
        
        // FIX: Use imported proto instead of client.proto
        const bytes = proto.Message.encode(finalContent).finish();
        
        const innerType = normalizeMessageContent(finalContent);

        let stanzaType = 'text';
        let extraAttrs = {};

        if (innerType?.audioMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'ptt'; }
        else if (innerType?.imageMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'image'; }
        else if (innerType?.videoMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'video'; }

        // 3. Send the stanza directly to WhatsApp
        const response = await client.query({
            tag: 'status',
            attrs: {
                to: channelJid,
                id: id,
                type: stanzaType,
                ...extraAttrs
            },
            content: [{ tag: 'plaintext', attrs: {}, content: bytes }]
        });

        // 4. Check for errors in the WhatsApp response
        if (response?.attrs?.error) {
            throw new Error(`WhatsApp rejected the status (Error ${response.attrs.error})`);
        }

        // 5. Show the ACTUAL result returned by WhatsApp
        const resultString = JSON.stringify(response, null, 2);
        await reply(`✅ *Status sent to server!*\n\n*Response from WhatsApp:*\n\`\`\`json\n${resultString}\n\`\`\``);

    } catch (error) {
        console.error("Channel Status Error:", error);
        await reply(`❌ Error posting Channel Status:\n${error.message}`);
    }
});
