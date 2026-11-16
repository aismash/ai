import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import { cmd } from '../command.js';
import {
    encodeNewsletterMessage,
    normalizeMessageContent,
    generateMessageIDV2
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

// ==================== HELPER: STRIP CONTEXT INFO ====================
function stripContextInfo(obj) {
    if (obj && typeof obj === 'object') {
        delete obj.contextInfo;
        Object.values(obj).forEach(stripContextInfo);
    }
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

// ==================== HELPER: CUSTOM NEWSLETTER UPLOADER ====================
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
    desc: "Post a 24-hour status to a WhatsApp Channel",
    category: "owner",
    filename: __filename
}, async (client, message, m, { isCreator, text, reply }) => {
    try {
        if (!isCreator) {
            return await reply("*📛 This is an owner command.*");
        }

        const args = text.split(' ');
        let channelInput = args[0];
        let statusText = args.slice(1).join(' ').trim();

        if (!channelInput) {
            return await reply("⚠️ *Usage:*\n`.cs <channel_link_or_jid> <text>`\n\n*Example:*\n`.cs https://whatsapp.com/channel/xxxx Hello followers!`\n\n_Reply to an image/video/voice/text to post a media status._");
        }

        // 1. Resolve Channel Link to JID
        let channelJid = channelInput;
        if (channelInput.includes('whatsapp.com/channel/')) {
            const resolved = await resolveChannelLink(client, channelInput);
            if (!resolved) return await reply("❌ Could not resolve that channel link. Make sure the link is valid.");
            channelJid = resolved;
        }

        if (!channelJid.endsWith('@newsletter')) {
            return await reply("❌ Invalid channel JID. It must end with `@newsletter`.");
        }

        let finalContent = {};

        // ==================== EXTRACT QUOTED CONTENT (Using m.quoted like your .vv cmd) ====================
        if (m.quoted) {
            const mtype = m.quoted.mtype; // Direct mtype, no need for message object keys
            
            if (mtype === 'imageMessage' || mtype === 'videoMessage' || mtype === 'audioMessage') {
                let buffer = await m.quoted.download();
                if (!buffer) return await reply("❌ Failed to download media.");
                
                let mediaType = null;
                if (mtype === 'imageMessage') mediaType = 'image';
                else if (mtype === 'videoMessage') mediaType = 'video';
                else if (mtype === 'audioMessage') mediaType = 'audio';

                if (mediaType === 'audio') {
                    await reply("🎙️ Converting audio to Voice Note...");
                    try {
                        buffer = await convertToVoiceNote(buffer);
                    } catch (e) {
                        console.warn("FFmpeg conversion failed:", e.message);
                    }
                }

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
                    finalContent = {
                        [mtype]: {
                            ...m.quoted.message[mtype],
                            directPath: uploaded.directPath,
                            fileSha256: uploaded.fileSha256,
                            fileLength: uploaded.fileLength,
                            url: undefined,
                            mediaKey: undefined,
                            fileEncSha256: undefined,
                            mediaKeyTimestamp: undefined,
                            caption: statusText || m.quoted.text || ""
                        }
                    };
                }
                stripContextInfo(finalContent);
            } 
            // Text Reply (Using m.quoted.text like your .vv command)
            else {
                if (!statusText) {
                    statusText = m.quoted.text || "";
                }
            }
        }

        // ==================== BUILD FINAL CONTENT ====================
        if (Object.keys(finalContent).length === 0) {
            if (statusText) {
                finalContent = {
                    extendedTextMessage: {
                        text: statusText,
                        backgroundArgb: 0xFF128C7E, 
                        font: 0 
                    }
                };
                stripContextInfo(finalContent);
            } else {
                return await reply("⚠️ Please provide text, or reply to an image/video/voice/text message.");
            }
        }

        // 2. Build and Send the Stanza
        const bytes = encodeNewsletterMessage(finalContent);
        const inner = normalizeMessageContent(finalContent);
        
        let stanzaType = 'text';
        let extraAttrs = {};

        if (inner?.audioMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'ptt'; }
        else if (inner?.imageMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'image'; }
        else if (inner?.videoMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'video'; }

        const stanza = {
            tag: 'status',
            attrs: { 
                id: generateMessageIDV2(client.user?.id), 
                to: channelJid, 
                type: stanzaType,
                ...extraAttrs
            },
            content: [{ 
                tag: 'plaintext', 
                attrs: {}, 
                content: bytes 
            }]
        };

        // 3. Send to WhatsApp and check exact response
        const response = await client.query(stanza);

        // 4. Error Handling Logic
        if (response?.attrs?.error === '401') {
            throw new Error("❌ You cannot post a status on this channel. You are not an admin.");
        }
        if (response?.attrs?.error) {
            throw new Error(`❌ WhatsApp rejected the status (Error ${response.attrs.error})`);
        }
        if (!response?.attrs?.server_id) {
            throw new Error("❌ Your channel is not eligible (No server ID returned). This may be due to rate limits or channel restrictions.");
        }

        // 5. Success
        await reply(`✅ Channel Status posted successfully! (Server ID: ${response.attrs.server_id})`);

    } catch (error) {
        console.error("Channel Status Error:", error);
        await reply(error.message);
    }
});
