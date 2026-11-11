// plugins/pingblock-menu.js - ESM Version (All Commands Merged)

import { fileURLToPath } from 'url';
import path from 'path';
import config from '../config.js';
import { cmd, commands } from '../command.js';
import { runtime, lidToPhone } from '../lib/functions.js';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ==================== PING2 COMMAND ====================
cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 500));
        const endTime = Date.now();
        const ping = endTime - startTime;
        let status;
        if (ping < 1000) status = "⚡ *Fast & Responsive*";
        else if (ping < 1400) status = "⚙️ *Normal Speed*";
        else status = "🐢 *Slow Response*";
        const msg = `
*╭┈──〔 ⚡ Kʜᴀɴ-ᴍᴅ Pɪɴɢ 〕─⊷*
*├▢ 📶 Response:* ${ping} ms
*├▢ 🧠 Status:* ${status}
*├▢ 💫 Mode:* Active & Stable
*╰───────────────⊷*
        `;
        await conn.sendMessage(from, { text: msg.trim() }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

// ==================== EXTRACT JID HELPER ====================
async function extractJid(client, m, q) {
    if (m.quoted) {
        let jid = m.quoted.sender;
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {}
        }
        return jid;
    }
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        let jid = m.mentionedJid[0];
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {}
        }
        return jid;
    }
    if (q) {
        if (q.includes('@') || q.includes('lid')) {
            let jid = q;
            if (jid && jid.includes('@lid')) {
                try {
                    const phoneNumber = await lidToPhone(client, jid);
                    if (phoneNumber) {
                        jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                    }
                } catch (e) {}
            }
            return jid;
        }
        const cleanNumber = q.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 10) {
            return cleanNumber + "@s.whatsapp.net";
        }
    }
    return null;
}

// ==================== BLOCK COMMAND ====================
cmd({
    pattern: "block",
    desc: "Blocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🚫",
    filename: __filename
}, async (client, message, m, { from, isCreator, q, react }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }
        let jid = await extractJid(client, m, q);
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }
        try {
            await client.updateBlockStatus(jid, "block");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully blocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Block command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to block the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to block the user."
        }, { quoted: message });
    }
});

// ==================== UNBLOCK COMMAND ====================
cmd({
    pattern: "unblock",
    desc: "Unblocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🔓",
    filename: __filename
}, async (client, message, m, { from, isCreator, q, react }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }
        let jid = await extractJid(client, m, q);
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }
        try {
            await client.updateBlockStatus(jid, "unblock");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully unblocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Unblock command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to unblock the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to unblock the user."
        }, { quoted: message });
    }
});

