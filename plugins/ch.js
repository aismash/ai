import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import { cmd } from '../command.js';
import {
    proto,
    generateWAMessageContent,
    generateMessageIDV2
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

        let content = {};
        let options = {};

        // ==================== HANDLE MEDIA (Image, Video, Audio) ====================
        if (m.quoted && m.quoted.mtype) {
            let buffer = await m.quoted.download();
            if (!buffer) return await reply("❌ Failed to download media.");

            const mtype = m.quoted.mtype;

            if (mtype === 'imageMessage') {
                content = { image: buffer, caption: statusText || m.quoted.text || '' };
            } 
            else if (mtype === 'videoMessage') {
                content = { video: buffer, caption: statusText || m.quoted.text || '' };
            } 
            else if (mtype === 'audioMessage') {
                await reply("🎙️ Converting audio to Voice Note...");
                try {
                    buffer = await convertToVoiceNote(buffer);
                } catch (e) {
                    console.warn("FFmpeg conversion failed, using original audio:", e.message);
                }
                content = { audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' };
            } 
            else {
                return await reply("❌ Unsupported media type. Only Image, Video, and Audio/Voice are supported.");
            }
        } 
        // ==================== HANDLE TEXT ====================
        else if (statusText) {
            content = { text: statusText };
            
            // Official Baileys text status styling (Background & Font)
            // You can add logic here to change colors/fonts based on text.
            // Defaulting to a nice blue background and standard font (0) if you want.
            // If you leave it empty, WhatsApp uses the default system color.
            options = { 
                // backgroundColor: '#128C7E', // Example hex color
                // font: 0 // 0=System, 1=Sans, 2=Serif, etc.
            };
        } 
        else {
            return await reply("⚠️ Please provide text or reply to an image/video/voice.");
        }

        // 2. Use Baileys Official generateWAMessageContent 
        // We pass 'options' here so Baileys applies the background/font to the text
        await reply("⏳ Uploading & Posting status to channel...");
        
        const inner = await generateWAMessageContent(content, { 
            ...options, 
            upload: client.waUploadToServer 
        });
        
        // 3. Build the special <status> stanza
        const id = generateMessageIDV2(client.user?.id);
        const bytes = proto.Message.encode(inner).finish();

        // 4. Send the stanza directly to WhatsApp
        const response = await client.query({
            tag: 'status',
            attrs: {
                to: channelJid,
                id: id,
                type: 'text'
            },
            content: [{ tag: 'plaintext', attrs: {}, content: bytes }]
        });

        // 5. Show the ACTUAL result returned by WhatsApp
        if (response?.attrs?.error) {
            throw new Error(`WhatsApp rejected the status (Error ${response.attrs.error})`);
        }

        const resultString = JSON.stringify(response, null, 2);
        await reply(`✅ *Status sent to server!*\n\n*Response from WhatsApp:*\n\`\`\`json\n${resultString}\n\`\`\``);

    } catch (error) {
        console.error("Channel Status Error:", error);
        await reply(`❌ Error posting Channel Status:\n${error.message}`);
    }
});
