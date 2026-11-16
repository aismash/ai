import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import { cmd } from '../command.js';
import {
    proto,
    generateWAMessageContent,
    generateMessageIDV2,
    normalizeMessageContent
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

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

        let content = {};
        let options = {}; // Added for text background/font

        // ==================== HANDLE MEDIA (Image, Video, Audio) ====================
        if (m.quoted && m.quoted.mtype) {
            const mtype = m.quoted.mtype;
            
            let mediaBuffer = null;
            let voiceBuf = null;

            if (mtype === 'imageMessage' || mtype === 'videoMessage' || mtype === 'audioMessage') {
                mediaBuffer = await m.quoted.download();
                if (!mediaBuffer) return await reply("❌ Failed to download media.");
                
                if (mtype === 'audioMessage') {
                    await reply("🎙️ Converting audio to Voice Note...");
                    try {
                        voiceBuf = await convertToVoiceNote(mediaBuffer);
                    } catch (e) {
                        console.warn("FFmpeg conversion failed, using original audio:", e.message);
                        voiceBuf = mediaBuffer;
                    }
                }
            } else {
                // Handle text reply
                if (!statusText) {
                    statusText = m.quoted.text || "";
                }
            }

            if (mtype === 'imageMessage') {
                content = { image: mediaBuffer, caption: statusText || m.quoted.text || '' };
            } else if (mtype === 'videoMessage') {
                content = { video: mediaBuffer, caption: statusText || m.quoted.text || '' };
            } else if (mtype === 'audioMessage') {
                content = { audio: voiceBuf, ptt: true, mimetype: 'audio/ogg; codecs=opus' };
            }
        }

        // ==================== HANDLE TEXT (With Background & Font) ====================
        if (Object.keys(content).length === 0) {
            if (statusText) {
                content = { text: statusText };
                // Text Styling (Official Baileys Options)
                options = { 
                    backgroundColor: '#128C7E', // WhatsApp Green
                    font: 0 // System font
                };
            } else {
                return await reply("⚠️ Please provide text, or reply to an image/video/voice/text message.");
            }
        }

        // 2. Use Baileys Official generateWAMessageContent 
        // Passing 'options' applies the text styling
        const inner = await generateWAMessageContent(content, { 
            ...options, 
            upload: client.waUploadToServer 
        });
        
        // 3. Build the special <status> stanza
        const id = generateMessageIDV2(client.user?.id);
        const bytes = proto.Message.encode(inner).finish();
        const innerType = normalizeMessageContent(inner);

        let stanzaType = 'text';
        let extraAttrs = {};

        if (innerType?.audioMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'ptt'; }
        else if (innerType?.imageMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'image'; }
        else if (innerType?.videoMessage) { stanzaType = 'media'; extraAttrs['mediatype'] = 'video'; }

        // 4. Send the stanza directly to WhatsApp
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

        // 5. Error Handling Logic
        if (response?.attrs?.error === '401') {
            throw new Error("❌ You cannot post a status on this channel. You are not an admin.");
        }
        if (response?.attrs?.error) {
            throw new Error(`❌ WhatsApp rejected the status (Error ${response.attrs.error})`);
        }
        if (!response?.attrs?.server_id) {
            throw new Error("❌ Your channel is not eligible (No server ID returned). This may be due to rate limits or channel restrictions.");
        }

        // 6. Success
        await reply(`✅ Channel Status posted successfully! (Server ID: ${response.attrs.server_id})`);

    } catch (error) {
        console.error("Channel Status Error:", error);
        await reply(error.message);
    }
});
