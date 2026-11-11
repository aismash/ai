// plugins/savestatus.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

// Define the command keywords
const commandKeywords = ["😍", "😢", "send", "sendme", "do", "give", "bhejo", "bhej", "save", "sand", "sent", "forward"];

// ==================== NO-PREFIX KEYWORD STATUS SAVER ====================
cmd({
    'on': "body"
}, async (client, message, store, {
    from,
    body,
    isGroup,
    reply,
    userConfig,
    sender
}) => {
    try {
        if (isGroup) return;
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        const messageText = body.toLowerCase();
        const containsKeyword = commandKeywords.some(word => messageText.includes(word));
        if (containsKeyword && message.quoted?.chat === 'status@broadcast') {
            const buffer = await message.quoted.download();
            const mtype = message.quoted.mtype;
            const originalCaption = message.quoted.text || '';
            const inboxJid = sender;
            let messageContent = {};
            switch (mtype) {
                case "imageMessage":
                    messageContent = {
                        image: buffer,
                        caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
                        mimetype: message.quoted.mimetype || "image/jpeg"
                    };
                    break;
                case "videoMessage":
                    messageContent = {
                        video: buffer,
                        caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
                        mimetype: message.quoted.mimetype || "video/mp4"
                    };
                    break;
                case "audioMessage":
                    messageContent = {
                        audio: buffer,
                        mimetype: "audio/mp4",
                        ptt: message.quoted.ptt || false
                    };
                    break;
                default:
                    return;
            }
            try {
                await client.sendMessage(inboxJid, messageContent, { quoted: message });
            } catch (sendError) {
                console.error("Failed to send status to inbox:", sendError);
            }
        }
    } catch (error) {
        console.error("Keyword Status Save Error:", error);
    }
});

// ==================== .SAVE COMMAND ====================
cmd({
    pattern: "save",
    alias: ["savestatus", "sv"],
    desc: "Save a status (reply to a status to save it to your inbox)",
    category: "download",
    filename: __filename
}, async (client, message, m, {
    from,
    reply,
    isGroup,
    sender,
    userConfig
}) => {
    try {
        if (!message.quoted) return;
        if (message.quoted.chat !== 'status@broadcast') return;
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";
        const buffer = await message.quoted.download();
        const mtype = message.quoted.mtype;
        const originalCaption = message.quoted.text || '';
        const inboxJid = sender;
        let messageContent = {};
        switch (mtype) {
            case "imageMessage":
                messageContent = {
                    image: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
                    mimetype: message.quoted.mimetype || "image/jpeg"
                };
                break;
            case "videoMessage":
                messageContent = {
                    video: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : (DESCRIPTION ? `> ${DESCRIPTION}` : ""),
                    mimetype: message.quoted.mimetype || "video/mp4"
                };
                break;
            case "audioMessage":
                messageContent = {
                    audio: buffer,
                    mimetype: "audio/mp4",
                    ptt: message.quoted.ptt || false
                };
                break;
            default:
                return;
        }
        try {
            await client.sendMessage(inboxJid, messageContent, { quoted: message });
        } catch (sendError) {
            console.error("Failed to save status:", sendError);
        }
    } catch (error) {
        console.error("Save Command Error:", error);
    }
});

// ==================== STRUCTURE COMMAND ====================
cmd({
    pattern: "structure",
    alias: ["raw", "debug"],
    desc: "Shows raw Baileys message structure",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) return;
        const content = JSON.stringify(mek, null, 2);
        return reply(`${content}`);
    } catch (e) {
        console.error("Error in raw command:", e);
    }
});

// ==================== STRUCTURE2 COMMAND ====================
cmd({
    pattern: "structure2",
    alias: ["raw2", "debug2"],
    desc: "Shows raw Baileys message structure",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const content = JSON.stringify(mek, null, 2);
        return reply(`${content}`);
    } catch (e) {
        console.error("Error in raw command:", e);
    }
});
