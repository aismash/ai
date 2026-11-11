// plugins/tools.js - ESM Version (All Commands Merged - No Shortcuts)

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import FormData from 'form-data';
import { Readable } from 'stream';
import googleTTS from 'google-tts-api';
import { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } from '../lib/functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== SURAH COMMAND ====================
cmd({
    pattern: "surah",
    desc: "Play Quran surah audio by number (1-114)",
    category: "download",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("📖 Please provide a surah number!\n\nExample: .surah 1");
        const surahNumber = parseInt(q);
        if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
            return await reply("❌ Invalid surah number! Use 1-114");
        }
        const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
        const response = await axios({ method: 'GET', url: audioUrl, responseType: 'stream' });
        const stream = response.data;
        stream._readableState = stream._readableState || {};
        stream.url = audioUrl;
        await conn.sendMessage(from, {
            document: stream,
            mimetype: "audio/mpeg",
            fileName: `SURAH-${surahNumber}.mp3`
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error("Error in .surah command:", e);
        await reply("❌ Error occurred, please try again!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});


// ==================== PRAYTIME COMMAND ====================
cmd({
    pattern: "praytime",
    alias: ["prayertimes", "prayertime", "ptime"],
    react: "✅",
    desc: "Get the prayer times, weather, and location for the city.",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const city = args.length > 0 ? args.join(" ") : "bhakkar";
        const apiUrl = `https://api.nexoracle.com/islamic/prayer-times?city=${city}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return reply('Error fetching prayer times!');
        }
        const data = await response.json();
        if (data.status !== 200) {
            return reply('Failed to get prayer times. Please try again later.');
        }
        const prayerTimes = data.result.items[0];
        const weather = data.result.today_weather;
        const location = data.result.city;
        let dec = `*Prayer Times for ${location}, ${data.result.state}*\n\n`;
        dec += `📍 *Location*: ${location}, ${data.result.state}, ${data.result.country}\n`;
        dec += `🕌 *Method*: ${data.result.prayer_method_name}\n\n`;
        dec += `🌅 *Fajr*: ${prayerTimes.fajr}\n`;
        dec += `🌄 *Shurooq*: ${prayerTimes.shurooq}\n`;
        dec += `☀️ *Dhuhr*: ${prayerTimes.dhuhr}\n`;
        dec += `🌇 *Asr*: ${prayerTimes.asr}\n`;
        dec += `🌆 *Maghrib*: ${prayerTimes.maghrib}\n`;
        dec += `🌃 *Isha*: ${prayerTimes.isha}\n\n`;
        dec += `🧭 *Qibla Direction*: ${data.result.qibla_direction}°\n`;
        const temperature = weather.temperature !== null ? `${weather.temperature}°C` : 'Data not available';
        dec += `🌡️ *Temperature*: ${temperature}\n`;
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/8fy6up.jpg` },
            caption: dec,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425151176864@newsletter',
                    newsletterName: 'JawadTechX',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply('*Error occurred while fetching prayer times and weather.*');
    }
});

// ==================== PRIVACY COMMAND ====================
cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Privacy settings menu",
    category: "setting",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• blocklist - View blocked users
┃◈┃• getbio - Get user's bio
┃◈┃• setppall - Set profile pic privacy
┃◈┃• setonline - Set online privacy
┃◈┃• setpp - Change bot's profile pic
┃◈┃• setmyname - Change bot's name
┃◈┃• updatebio - Change bot's bio
┃◈┃• groupsprivacy - Set group add privacy
┃◈┃• getprivacy - View current privacy settings
┃◈┃• getpp - Get user's profile picture
┃◈┃
┃◈┃*Options for privacy commands:*
┃◈┃• all - Everyone
┃◈┃• contacts - My contacts only
┃◈┃• contact_blacklist - Contacts except blocked
┃◈┃• none - Nobody
┃◈┃• match_last_seen - Match last seen
┃◈└───────────┈⊷
╰──────────────┈⊷
*Note:* Most commands are owner-only`;
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/7zfdcq.jpg` },
            caption: privacyMenu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425151176864@newsletter',
                    newsletterName: "Privacy Settings",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// ==================== BLOCKLIST COMMAND ====================
cmd({
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "setting",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 You are not the owner!*");
    try {
        const blockedUsers = await conn.fetchBlocklist();
        if (blockedUsers.length === 0) {
            return reply("📋 Your block list is empty.");
        }
        const list = blockedUsers.map((user, i) => `🚧 BLOCKED ${user.split('@')[0]}`).join('\n');
        const count = blockedUsers.length;
        reply(`📋 Blocked Users (${count}):\n\n${list}`);
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

// ==================== GETBIO COMMAND ====================
cmd({
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "setting",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus?.(jid);
        if (!about) return reply("No bio found.");
        return reply(`User Bio:\n\n${about.status}`);
    } catch (error) {
        console.error("Error in bio command:", error);
        reply("No bio found.");
    }
});

// ==================== SETPPALL COMMAND ====================
cmd({
    pattern: "setppall",
    desc: "Update Profile Picture Privacy",
    category: "setting",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ You are not the owner!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'contacts', 'contact_blacklist', 'none'.");
        }
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ Profile picture privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});

// ==================== SETONLINE COMMAND ====================
cmd({
    pattern: "setonline",
    desc: "Update Online Privacy",
    category: "setting",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ You are not the owner!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'match_last_seen'];
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'match_last_seen'.");
        }
        await conn.updateOnlinePrivacy(value);
        reply(`✅ Online privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});

// ==================== SETNAME COMMAND ====================
cmd({
    pattern: "setname",
    desc: "Set your WhatsApp display name.",
    category: "setting",
    react: "👄",
    filename: __filename
}, async (conn, mek, m, { isCreator, reply, args }) => {
    if (!isCreator) return reply("❌ You are not the owner!");
    const displayName = args.join(" ");
    if (!displayName) return reply("❌ Please provide a display name.");
    try {
        await conn.updateProfileName(displayName);
        reply(`✅ Your display name has been set to: ${displayName}`);
    } catch (err) {
        console.error(err);
        reply("❌ Failed to set your display name.");
    }
});

// ==================== UPDATEBIO COMMAND ====================
cmd({
    pattern: "updatebio",
    react: "🥏",
    desc: "Change the Bot number Bio.",
    category: "setting",
    use: '.updatebio',
    filename: __filename
}, async (conn, mek, m, { from, q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply('🚫 *You must be an Owner to use this command*');
        if (!q) return reply('❓ *Enter the New Bio*');
        if (q.length > 139) return reply('❗ *Sorry! Character limit exceeded*');
        await conn.updateProfileStatus(q);
        await conn.sendMessage(from, { text: "✔️ *New Bio Added Successfully*" }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        console.log(e);
    }
});

// ==================== GROUPSPRIVACY COMMAND ====================
cmd({
    pattern: "groupsprivacy",
    desc: "Update Group Add Privacy",
    category: "setting",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❌ You are not the owner!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        if (!validValues.includes(value)) {
            return reply("❌ Invalid option. Valid options are: 'all', 'contacts', 'contact_blacklist', 'none'.");
        }
        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${e.message}`);
    }
});

// ==================== GETPRIVACY COMMAND ====================
cmd({
    pattern: "getprivacy",
    desc: "Get the bot Number Privacy Setting Updates.",
    category: "setting",
    use: '.getprivacy',
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply('🚫 *You must be an Owner to use this command*');
        const duka = await conn.fetchPrivacySettings?.(true);
        if (!duka) return reply('🚫 *Failed to fetch privacy settings*');
        let puka = `
╭───「 𝙿𝚁𝙸𝚅𝙰𝙲𝚈  」───◆  
│ ∘ 𝚁𝚎𝚊𝚍 𝚁𝚎𝚌𝚎𝚒𝚙𝚝: ${duka.readreceipts}  
│ ∘ 𝙿𝚛𝚘𝚏𝚒𝚕𝚎 𝙿𝚒𝚌𝚝𝚞𝚛𝚎: ${duka.profile}  
│ ∘ 𝚂𝚝𝚊𝚝𝚞𝚜: ${duka.status}  
│ ∘ 𝙾𝚗𝚕𝚒𝚗𝚎: ${duka.online}  
│ ∘ 𝙻𝚊𝚜𝚝 𝚂𝚎𝚎𝚗: ${duka.last}  
│ ∘ 𝙶𝚛𝚘𝚞𝚙 𝙿𝚛𝚒𝚟𝚊𝚌𝚢: ${duka.groupadd}  
│ ∘ 𝙲𝚊𝚕𝚕 𝙿𝚛𝚒𝚟𝚊𝚌𝚢: ${duka.calladd}  
╰────────────────────`;
        await conn.sendMessage(from, { text: puka }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        console.log(e);
    }
});

// ==================== CAPTION COMMAND ====================
cmd({
    pattern: "caption",
    alias: ["cap", "recaption", "c"],
    react: '✏️',
    desc: "Add or change caption of media/document",
    category: "utility",
    filename: __filename
}, async (client, message, match, { from }) => {
    try {
        if (!message.quoted) {
            return await client.sendMessage(from, {
                text: "*🍁 Please reply to a media message (image/video/document) to add caption!*\n\n*Usage:*\n- Reply to media with .caption [your text]\n- Or just .caption [text] to add caption to previous media"
            }, { quoted: message });
        }
        const quotedMsg = message.quoted;
        if (!quotedMsg || !quotedMsg.download) {
            return await client.sendMessage(from, {
                text: "❌ The quoted message is not valid media"
            }, { quoted: message });
        }
        const buffer = await quotedMsg.download();
        const mtype = quotedMsg.mtype;
        const cmdText = message.body.split(' ')[0].toLowerCase();
        const newCaption = message.body.slice(cmdText.length).trim();
        if (!buffer) {
            return await client.sendMessage(from, {
                text: "❌ Failed to download the media"
            }, { quoted: message });
        }
        const messageContent = {
            caption: newCaption,
            mimetype: quotedMsg.mimetype
        };
        switch (mtype) {
            case "imageMessage":
                messageContent.image = buffer;
                messageContent.mimetype = messageContent.mimetype || "image/jpeg";
                break;
            case "videoMessage":
                messageContent.video = buffer;
                messageContent.mimetype = messageContent.mimetype || "video/mp4";
                break;
            case "documentMessage":
                messageContent.document = buffer;
                messageContent.mimetype = messageContent.mimetype || "application/octet-stream";
                break;
            case "audioMessage":
                messageContent.audio = buffer;
                messageContent.mimetype = messageContent.mimetype || "audio/mp4";
                messageContent.ptt = quotedMsg.ptt || false;
                break;
            default:
                return await client.sendMessage(from, {
                    text: "❌ Only image, video, document and audio messages can be recaptioned"
                }, { quoted: message });
        }
        await client.sendMessage(from, messageContent, { quoted: message });
    } catch (error) {
        console.error("Caption Error:", error);
        await client.sendMessage(from, {
            text: "❌ Error adding caption:\n" + (error.message || error.toString())
        }, { quoted: message });
    }
});

// ==================== REPEAT COMMAND ====================
cmd({
    pattern: "repeat",
    alias: ["rp", "rpm"],
    desc: "Repeat a message a specified number of times.",
    category: "fun",
    filename: __filename
}, async (conn, m, store, { args, reply, from }) => {
    try {
        if (!args[0]) {
            return reply("✳️ Use this command like:\n*Example:* .repeat 10,I love you");
        }
        const [countStr, ...messageParts] = args.join(" ").split(",");
        const count = parseInt(countStr.trim());
        const message = messageParts.join(",").trim();
        if (isNaN(count) || count <= 0 || count > 300) {
            return reply("❎ Please specify a valid number between 1 and 300.");
        }
        if (!message) {
            return reply("❎ Please provide a message to repeat.");
        }
        reply(`🔁 Sending "${message}" ${count} times...`);
        for (let i = 0; i < count; i++) {
            await conn.sendMessage(from, { text: message }, { quoted: m });
            await sleep(1000);
        }
    } catch (error) {
        console.error("❌ Error in repeat command:", error);
        reply("❎ An error occurred while processing your request.");
    }
});

// ==================== SREPO COMMAND ====================
cmd({
    pattern: "srepo",
    desc: "Fetch information about a GitHub repository.",
    category: "other",
    react: "🍃",
    filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
    try {
        const repoName = args.join(" ");
        if (!repoName) {
            return reply("❌ Please provide a GitHub repository in the format 📌 `owner/repo`.");
        }
        const apiUrl = `https://api.github.com/repos/${repoName}`;
        const { data } = await axios.get(apiUrl);
        let responseMsg = `📁 *GitHub Repository Info* 📁\n\n`;
        responseMsg += `📌 *Name*: ${data.name}\n`;
        responseMsg += `🔗 *URL*: ${data.html_url}\n`;
        responseMsg += `📝 *Description*: ${data.description || "No description"}\n`;
        responseMsg += `⭐ *Stars*: ${data.stargazers_count}\n`;
        responseMsg += `🍴 *Forks*: ${data.forks_count}\n`;
        responseMsg += `👤 *Owner*: ${data.owner.login}\n`;
        responseMsg += `📅 *Created At*: ${new Date(data.created_at).toLocaleDateString()}\n`;
        responseMsg += `\n> *© Powered by JawadTechX*`;
        await conn.sendMessage(from, { text: responseMsg }, { quoted: m });
    } catch (error) {
        console.error("GitHub API Error:", error);
        reply(`❌ Error fetching repository data: ${error.response?.data?.message || error.message}`);
    }
});

// ==================== TTS COMMAND ====================
cmd({
    pattern: "tts",
    desc: "Convert text to speech",
    category: "download",
    react: "💀",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Need some text.");
        const url = googleTTS.getAudioUrl(q, {
            lang: 'hi-IN',
            slow: false,
            host: 'https://translate.google.com',
        });
        await conn.sendMessage(from, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });
    } catch (a) {
        reply(`${a}`);
    }
});

// ==================== UGUU UPLOAD HELPER ====================
async function uploadToUguu(buffer, mimeType) {
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('image/webp')) extension = '.webp';
    else extension = '.jpg';

    const fileName = `image${extension}`;
    const form = new FormData();
    form.append('files[]', buffer, fileName);

    const response = await axios.post("https://uguu.se/upload", form, {
        headers: {
            ...form.getHeaders(),
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile)"
        },
        timeout: 60000
    });

    let imageUrl = null;
    if (response.data && response.data.files && response.data.files[0]) {
        imageUrl = response.data.files[0].url;
    }
    if (!imageUrl) {
        throw new Error("Failed to upload image to Uguu");
    }
    return imageUrl;
}

// ==================== PROCESS IMAGE HELPER ====================
async function processImageCommand(conn, mek, m, from, reply, resolusi, commandName) {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/upscale?url=${encodedUrl}&resolusi=${resolusi}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: `*✅ Image ${commandName} (Resolution ${resolusi})*\n> *🚀 Powered by JAWAD-MD*`
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error(`Error in ${commandName}:`, e);
        reply(`❌ Error: ${e.message}`);
    }
}

// ==================== UPSCALE1 COMMAND ====================
cmd({
    pattern: "upscale1",
    alias: ["hd1"],
    desc: "Upscale image with resolution 1",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 1, "Upscaled");
});

// ==================== UPSCALE2 COMMAND ====================
cmd({
    pattern: "upscale2",
    alias: ["hd2"],
    desc: "Upscale image with resolution 2",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 2, "Upscaled");
});

// ==================== UPSCALE3 COMMAND ====================
cmd({
    pattern: "upscale3",
    alias: ["hd3"],
    desc: "Upscale image with resolution 3",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 3, "Upscaled");
});

// ==================== UPSCALE4 COMMAND ====================
cmd({
    pattern: "upscale4",
    alias: ["hd4"],
    desc: "Upscale image with resolution 4",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 4, "Upscaled");
});

// ==================== UPSCALE5 COMMAND ====================
cmd({
    pattern: "upscale5",
    alias: ["hd5"],
    desc: "Upscale image with resolution 5",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 5, "Upscaled");
});

// ==================== UPSCALE6 COMMAND ====================
cmd({
    pattern: "upscale6",
    alias: ["hd6"],
    desc: "Upscale image with resolution 6",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 6, "Upscaled");
});

// ==================== UPSCALE7 COMMAND ====================
cmd({
    pattern: "upscale7",
    alias: ["hd7"],
    desc: "Upscale image with resolution 7",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 7, "Upscaled");
});

// ==================== UPSCALE8 COMMAND ====================
cmd({
    pattern: "upscale8",
    alias: ["hd8"],
    desc: "Upscale image with resolution 8",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 8, "Upscaled");
});

// ==================== UPSCALE9 COMMAND ====================
cmd({
    pattern: "upscale9",
    alias: ["hd9"],
    desc: "Upscale image with resolution 9",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 9, "Upscaled");
});

// ==================== UPSCALE10 COMMAND ====================
cmd({
    pattern: "upscale10",
    alias: ["hd10"],
    desc: "Upscale image with resolution 10",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 10, "Upscaled");
});

// ==================== UPSCALE11 COMMAND ====================
cmd({
    pattern: "upscale11",
    alias: ["hd11"],
    desc: "Upscale image with resolution 11",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 11, "Upscaled");
});

// ==================== UPSCALE12 COMMAND ====================
cmd({
    pattern: "upscale12",
    alias: ["hd12"],
    desc: "Upscale image with resolution 12",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 12, "Upscaled");
});

// ==================== UPSCALE13 COMMAND ====================
cmd({
    pattern: "upscale13",
    alias: ["hd13"],
    desc: "Upscale image with resolution 13",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 13, "Upscaled");
});

// ==================== UPSCALE14 COMMAND ====================
cmd({
    pattern: "upscale14",
    alias: ["hd14"],
    desc: "Upscale image with resolution 14",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 14, "Upscaled");
});

// ==================== UPSCALE15 COMMAND ====================
cmd({
    pattern: "upscale15",
    alias: ["hd15"],
    desc: "Upscale image with resolution 15",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 15, "Upscaled");
});

// ==================== UPSCALE16 COMMAND ====================
cmd({
    pattern: "upscale16",
    alias: ["hd16"],
    desc: "Upscale image with resolution 16",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    await processImageCommand(conn, mek, m, from, reply, 16, "Upscaled");
});

// ==================== UNBLUR COMMAND ====================
cmd({
    pattern: "unblur",
    alias: ["sharpen"],
    desc: "Remove blur from image",
    category: "tools",
    react: "✨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/unblur?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Unblurred Successfully*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Unblur Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== BLUR COMMAND ====================
cmd({
    pattern: "blurface",
    alias: ["blur"],
    desc: "Apply blur effect to image",
    category: "tools",
    react: "🌫️",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/blurface?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Blur Effect Applied*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Blur Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== REMOVEBG COMMAND ====================
cmd({
    pattern: "removebg",
    alias: ["nobg1", "rmbg1"],
    desc: "Remove background from image (v1)",
    category: "tools",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/removebg?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Background Removed (v1)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('RemoveBG Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== REMOVEBG2 COMMAND ====================
cmd({
    pattern: "removebg2",
    alias: ["nobg2", "rmbg2"],
    desc: "Remove background from image (v2)",
    category: "tools",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/v1/removebg?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Background Removed (v2)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('RemoveBG2 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== REMINI COMMAND ====================
cmd({
    pattern: "remini",
    alias: ["enhance2", "hd2"],
    desc: "Enhance image quality using Remini",
    category: "tools",
    react: "🌟",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/remini?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Enhanced with Remini*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Remini Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ENHANCE1 COMMAND ====================
cmd({
    pattern: "enhance1",
    alias: ["enh1"],
    desc: "Enhance image with resolution 1",
    category: "tools",
    react: "🔆",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=1`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Enhanced (Resolution 1)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Enhance1 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ENHANCE4 COMMAND ====================
cmd({
    pattern: "enhance4",
    alias: ["enh4"],
    desc: "Enhance image with resolution 4",
    category: "tools",
    react: "🔆",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=4`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Enhanced (Resolution 4)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Enhance4 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ENHANCE8 COMMAND ====================
cmd({
    pattern: "enhance8",
    alias: ["enh8"],
    desc: "Enhance image with resolution 8",
    category: "tools",
    react: "🔆",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=8`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Enhanced (Resolution 8)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Enhance8 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ENHANCE16 COMMAND ====================
cmd({
    pattern: "enhance16",
    alias: ["enh16"],
    desc: "Enhance image with resolution 16",
    category: "tools",
    react: "🔆",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=16`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Enhanced (Resolution 16)*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Enhance16 Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== COLORIZE COMMAND ====================
cmd({
    pattern: "colorize",
    alias: ["color", "addcolor"],
    desc: "Add color to black and white images",
    category: "tools",
    react: "🌈",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);
        const apiUrl = `https://api.nexray.web.id/tools/colorize?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        await conn.sendMessage(from, {
            image: Buffer.from(response.data),
            caption: "*✅ Image Colorized Successfully*\n> *🚀 Powered by JAWAD-MD*"
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Colorize Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== BOY DP URLS ====================
const boyDpUrls = {
    url1: 'https://files.catbox.moe/y1l7ed.jpg',
    url2: 'https://files.catbox.moe/4kujce.jpg',
    url3: 'https://files.catbox.moe/vrrn72.jpg',
    url4: 'https://files.catbox.moe/7w87wk.jpg',
    url5: 'https://files.catbox.moe/jf7cwz.jpg',
    url6: 'https://files.catbox.moe/gc3c1g.jpg',
    url7: 'https://files.catbox.moe/nufhim.jpg',
    url8: 'https://files.catbox.moe/yfce44.jpg',
    url9: 'https://files.catbox.moe/gdhv0h.jpg',
    url10: 'https://files.catbox.moe/ptwcm0.jpg',
    url11: 'https://files.catbox.moe/3upyka.jpg',
    url12: 'https://files.catbox.moe/erj2f8.jpg',
    url13: 'https://files.catbox.moe/g50vs5.jpg',
    url14: 'https://files.catbox.moe/1jta5y.jpg',
    url15: 'https://files.catbox.moe/siph10.jpg',
    url16: 'https://files.catbox.moe/mxlbfq.jpg',
    url17: 'https://files.catbox.moe/3aqy6x.jpg',
    url18: 'https://files.catbox.moe/0qvy21.jpg',
    url19: 'https://files.catbox.moe/szdoa0.jpg',
    url20: 'https://files.catbox.moe/3upyka.jpg',
    url21: 'https://files.catbox.moe/jadoal.jpg',
    url22: 'https://files.catbox.moe/yfce44.jpg'
};
const boyCaption = `* BOY DP*`;

// ==================== BOYDP1 COMMAND ====================
cmd({ pattern: "boydp1", desc: "Send boy DP 1", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url1 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp1:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP2 COMMAND ====================
cmd({ pattern: "boydp2", desc: "Send boy DP 2", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url2 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp2:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP3 COMMAND ====================
cmd({ pattern: "boydp3", desc: "Send boy DP 3", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url3 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp3:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP4 COMMAND ====================
cmd({ pattern: "boydp4", desc: "Send boy DP 4", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url4 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp4:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP5 COMMAND ====================
cmd({ pattern: "boydp5", desc: "Send boy DP 5", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url5 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp5:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP6 COMMAND ====================
cmd({ pattern: "boydp6", desc: "Send boy DP 6", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url6 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp6:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP7 COMMAND ====================
cmd({ pattern: "boydp7", desc: "Send boy DP 7", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url7 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp7:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP8 COMMAND ====================
cmd({ pattern: "boydp8", desc: "Send boy DP 8", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url8 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp8:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP9 COMMAND ====================
cmd({ pattern: "boydp9", desc: "Send boy DP 9", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url9 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp9:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP10 COMMAND ====================
cmd({ pattern: "boydp10", desc: "Send boy DP 10", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url10 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp10:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP11 COMMAND ====================
cmd({ pattern: "boydp11", desc: "Send boy DP 11", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url11 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp11:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP12 COMMAND ====================
cmd({ pattern: "boydp12", desc: "Send boy DP 12", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url12 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp12:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP13 COMMAND ====================
cmd({ pattern: "boydp13", desc: "Send boy DP 13", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url13 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp13:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP14 COMMAND ====================
cmd({ pattern: "boydp14", desc: "Send boy DP 14", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url14 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp14:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP15 COMMAND ====================
cmd({ pattern: "boydp15", desc: "Send boy DP 15", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url15 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp15:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP16 COMMAND ====================
cmd({ pattern: "boydp16", desc: "Send boy DP 16", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url16 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp16:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP17 COMMAND ====================
cmd({ pattern: "boydp17", desc: "Send boy DP 17", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url17 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp17:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP18 COMMAND ====================
cmd({ pattern: "boydp18", desc: "Send boy DP 18", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url18 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp18:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP19 COMMAND ====================
cmd({ pattern: "boydp19", desc: "Send boy DP 19", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url19 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp19:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP20 COMMAND ====================
cmd({ pattern: "boydp20", desc: "Send boy DP 20", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url20 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp20:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP21 COMMAND ====================
cmd({ pattern: "boydp21", desc: "Send boy DP 21", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url21 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp21:", e); await reply("Failed to send image."); }
});

// ==================== BOYDP22 COMMAND ====================
cmd({ pattern: "boydp22", desc: "Send boy DP 22", category: "fun", react: "👦", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: boyDpUrls.url22 }, mimetype: 'image/jpeg', caption: boyCaption }, { quoted: mek });
    } catch (e) { console.error("Error in boydp22:", e); await reply("Failed to send image."); }
});

// ==================== GIRL DP URLS ====================
const girlDpUrls = {
    url1: 'https://files.catbox.moe/yrv3t8.jpg',
    url2: 'https://files.catbox.moe/mgxcmh.jpg',
    url3: 'https://files.catbox.moe/57p7bs.jpg',
    url4: 'https://files.catbox.moe/ct3x5i.jpg',
    url5: 'https://files.catbox.moe/i32r8e.jpg',
    url6: 'https://files.catbox.moe/9vx3oh.jpg',
    url7: 'https://files.catbox.moe/tvy3fg.jpg',
    url8: 'https://files.catbox.moe/wt1017.jpg',
    url9: 'https://files.catbox.moe/3fklx4.jpg',
    url10: 'https://files.catbox.moe/blfy4i.jpg',
    url11: 'https://files.catbox.moe/kafz5k.jpg',
    url12: 'https://files.catbox.moe/rrb30k.jpg',
    url13: 'https://files.catbox.moe/5vb4n9.jpg',
    url14: 'https://files.catbox.moe/57p7bs.jpg',
    url15: 'https://files.catbox.moe/6f6qob.jpg',
    url16: 'https://files.catbox.moe/48itao.jpg',
    url17: 'https://files.catbox.moe/dsqk27.jpg',
    url18: 'https://files.catbox.moe/1uygix.jpg',
    url19: 'https://files.catbox.moe/80r3n0.jpg',
    url20: 'https://files.catbox.moe/ieyqak.jpg',
    url21: 'https://files.catbox.moe/c9bi22.webp',
    url22: 'https://files.catbox.moe/a0vrdt.jpg'
};
const girlCaption = `*FOR YOU*`;

function getMime(url) {
    return url.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
}

// ==================== GIRLDP1 COMMAND ====================
cmd({ pattern: "girldp1", desc: "Send girl DP 1", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url1 }, mimetype: getMime(girlDpUrls.url1), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp1:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP2 COMMAND ====================
cmd({ pattern: "girldp2", desc: "Send girl DP 2", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url2 }, mimetype: getMime(girlDpUrls.url2), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp2:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP3 COMMAND ====================
cmd({ pattern: "girldp3", desc: "Send girl DP 3", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url3 }, mimetype: getMime(girlDpUrls.url3), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp3:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP4 COMMAND ====================
cmd({ pattern: "girldp4", desc: "Send girl DP 4", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url4 }, mimetype: getMime(girlDpUrls.url4), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp4:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP5 COMMAND ====================
cmd({ pattern: "girldp5", desc: "Send girl DP 5", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url5 }, mimetype: getMime(girlDpUrls.url5), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp5:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP6 COMMAND ====================
cmd({ pattern: "girldp6", desc: "Send girl DP 6", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url6 }, mimetype: getMime(girlDpUrls.url6), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp6:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP7 COMMAND ====================
cmd({ pattern: "girldp7", desc: "Send girl DP 7", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url7 }, mimetype: getMime(girlDpUrls.url7), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp7:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP8 COMMAND ====================
cmd({ pattern: "girldp8", desc: "Send girl DP 8", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url8 }, mimetype: getMime(girlDpUrls.url8), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp8:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP9 COMMAND ====================
cmd({ pattern: "girldp9", desc: "Send girl DP 9", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url9 }, mimetype: getMime(girlDpUrls.url9), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp9:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP10 COMMAND ====================
cmd({ pattern: "girldp10", desc: "Send girl DP 10", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url10 }, mimetype: getMime(girlDpUrls.url10), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp10:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP11 COMMAND ====================
cmd({ pattern: "girldp11", desc: "Send girl DP 11", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url11 }, mimetype: getMime(girlDpUrls.url11), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp11:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP12 COMMAND ====================
cmd({ pattern: "girldp12", desc: "Send girl DP 12", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url12 }, mimetype: getMime(girlDpUrls.url12), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp12:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP13 COMMAND ====================
cmd({ pattern: "girldp13", desc: "Send girl DP 13", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url13 }, mimetype: getMime(girlDpUrls.url13), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp13:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP14 COMMAND ====================
cmd({ pattern: "girldp14", desc: "Send girl DP 14", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url14 }, mimetype: getMime(girlDpUrls.url14), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp14:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP15 COMMAND ====================
cmd({ pattern: "girldp15", desc: "Send girl DP 15", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url15 }, mimetype: getMime(girlDpUrls.url15), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp15:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP16 COMMAND ====================
cmd({ pattern: "girldp16", desc: "Send girl DP 16", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url16 }, mimetype: getMime(girlDpUrls.url16), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp16:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP17 COMMAND ====================
cmd({ pattern: "girldp17", desc: "Send girl DP 17", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url17 }, mimetype: getMime(girlDpUrls.url17), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp17:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP18 COMMAND ====================
cmd({ pattern: "girldp18", desc: "Send girl DP 18", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url18 }, mimetype: getMime(girlDpUrls.url18), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp18:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP19 COMMAND ====================
cmd({ pattern: "girldp19", desc: "Send girl DP 19", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url19 }, mimetype: getMime(girlDpUrls.url19), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp19:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP20 COMMAND ====================
cmd({ pattern: "girldp20", desc: "Send girl DP 20", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url20 }, mimetype: getMime(girlDpUrls.url20), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp20:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP21 COMMAND ====================
cmd({ pattern: "girldp21", desc: "Send girl DP 21", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url21 }, mimetype: getMime(girlDpUrls.url21), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp21:", e); await reply("Failed to send image."); }
});

// ==================== GIRLDP22 COMMAND ====================
cmd({ pattern: "girldp22", desc: "Send girl DP 22", category: "fun", react: "🌸", filename: __filename },
async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { image: { url: girlDpUrls.url22 }, mimetype: getMime(girlDpUrls.url22), caption: girlCaption }, { quoted: mek });
    } catch (e) { console.error("Error in girldp22:", e); await reply("Failed to send image."); }
});

// ==================== GPASS COMMAND ====================
cmd({
    pattern: "gpass",
    desc: "Generate a strong password.",
    category: "other",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const length = args[0] ? parseInt(args[0]) : 12;
        if (isNaN(length) || length < 8) {
            return reply('Please provide a valid length for the password (Minimum 08 Characters).');
        }
        const generatePassword = (len) => {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
            let password = '';
            for (let i = 0; i < len; i++) {
                const randomIndex = crypto.randomInt(0, charset.length);
                password += charset[randomIndex];
            }
            return password;
        };
        const password = generatePassword(length);
        const message = `🔐 *Your Strong Password* 🔐\n\nPlease find your generated password below`;
        await conn.sendMessage(from, { text: message }, { quoted: mek });
        await conn.sendMessage(from, { text: password }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error generating password🤕: ${e.message}`);
    }
});

// ==================== GETIMAGE COMMAND ====================
cmd({
    pattern: "getimage",
    alias: ["tophoto", "url2image", "urltoimage", "imagefromurl", "fetchimage"],
    desc: "Convert image URL to WhatsApp image",
    category: "utility",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply('Please provide an image URL\nExample: !getimage https://example.com/image.jpg');
        const imageUrl = text.trim();
        if (!imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
            return reply('❌ Invalid image URL! Must be direct link to image (jpg/png/gif/webp)');
        }
        try {
            const response = await axios.head(imageUrl);
            if (!response.headers['content-type']?.startsWith('image/')) {
                return reply('❌ URL does not point to a valid image');
            }
        } catch (e) {
            return reply('❌ Could not access image URL. Please check the link');
        }
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: 'Here is your image from the URL'
        }, { quoted: mek });
    } catch (error) {
        console.error('GetImage Error:', error);
        reply('❌ Failed to process image. Error: ' + error.message);
    }
});

// ==================== OWNER COMMAND ====================
cmd({
    pattern: "owner",
    desc: "Get owner number",
    category: "main",
    react: "🎮",
    filename: __filename
}, async (conn, m, msg, { from, userConfig, botNumber }) => {
    try {
        await conn.sendMessage(from, { react: { text: "📇", key: m.key } });
        await new Promise(resolve => setTimeout(resolve, 3000));
        const ownerName = userConfig?.OWNER_NAME || config.OWNER_NAME || "Owner";
        const botName = userConfig?.BOT_NAME || config.BOT_NAME || "Bot";
        const cleanNumber = botNumber.replace(/[^0-9]/g, '');
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${ownerName}\n` +
            `ORG:${botName} Team;\n` +
            `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:${'+' + cleanNumber}\n` +
            'END:VCARD';
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });
        await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error("Error sending contact:", e);
        await conn.sendMessage(from, { text: `❌ Couldn't send contact:\n${e.message}` });
    }
});

// ==================== SHAYARI COMMAND ====================
cmd({
    pattern: "shayari",
    alias: ["shayar", "poetry"],
    desc: "Get a random romantic shayari",
    react: "💖",
    category: "fun",
    use: '.shayari',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo';
        const { data } = await axios.get(apiUrl);
        if (!data.result) return reply("❌ Shayari dil mein nahi aayi, phir try karo!");
        const shayariMessage = `${data.result}`.trim();
        await reply(shayariMessage);
    } catch (error) {
        console.error('Shayari Error:', error);
        reply("❌ Aaj dil mein shayari nahi hai... Kal try karna!");
    }
});

// ==================== GITCLONE COMMAND ====================
cmd({
    pattern: "gitclone",
    alias: ["git"],
    desc: "Download any public GitHub repo as ZIP",
    category: "download",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("📌 *Usage:* .git <repo_link>");
        await conn.sendMessage(m.chat, { react: { text: '⬇️', key: mek.key } });
        const url = args[0];
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/i);
        if (!match) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
            return reply("❌ Invalid GitHub link.");
        }
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        const branches = ['main', 'master'];
        let zipData = null;
        for (const branch of branches) {
            const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
            try {
                const res = await axios.get(zipUrl, { responseType: 'arraybuffer' });
                zipData = res.data;
                break;
            } catch {}
        }
        if (!zipData) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
            return reply("❌ Failed to download. Branch not found.");
        }
        const filePath = path.join(process.cwd(), `${repo}.zip`);
        fs.writeFileSync(filePath, zipData);
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: `${repo}.zip`,
            mimetype: 'application/zip'
        }, { quoted: mek });
        fs.unlinkSync(filePath);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        console.error("Git Download Error:", e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
        reply("❌ Failed to download repo.");
    }
});

// ==================== GITHUBSTALK COMMAND ====================
cmd({
    pattern: "githubstalk",
    desc: "Fetch detailed GitHub user profile including profile picture.",
    category: "main",
    react: "🖥️",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const username = args[0];
        if (!username) return reply("Please provide a GitHub username.");
        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        let userInfo = `👤 *Username*: ${data.name || data.login}\n🔗 *Github Url*:(${data.html_url})\n📝 *Bio*: ${data.bio || 'Not available'}\n🏙️ *Location*: ${data.location || 'Unknown'}\n📊 *Public Repos*: ${data.public_repos}\n👥 *Followers*: ${data.followers} | Following: ${data.following}\n📅 *Created At*: ${new Date(data.created_at).toDateString()}\n🔭 *Public Gists*: ${data.public_gists}\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: data.avatar_url }, caption: userInfo }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`error: ${e.response ? e.response.data.message : e.message}`);
    }
});

// ==================== GARL COMMAND ====================
cmd({
    pattern: "garl",
    alias: ["imgloli"],
    react: '😎',
    desc: "Download anime loli images.",
    category: "anime",
    use: '.loli',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
        let wm = `😎 Random Garl image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.data[0].urls.original }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== WAIFU COMMAND ====================
cmd({
    pattern: "waifu",
    alias: ["imgwaifu"],
    react: '💫',
    desc: "Download anime waifu images.",
    category: "anime",
    use: '.waifu',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.waifu.pics/sfw/waifu');
        let wm = `🩵 Random Waifu image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== NEKO COMMAND ====================
cmd({
    pattern: "neko",
    alias: ["imgneko"],
    react: '💫',
    desc: "Download anime neko images.",
    category: "anime",
    use: '.neko',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.waifu.pics/sfw/neko');
        let wm = `🩷 Random neko image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== MEGUMIN COMMAND ====================
cmd({
    pattern: "megumin",
    alias: ["imgmegumin"],
    react: '💕',
    desc: "Download anime megumin images.",
    category: "anime",
    use: '.megumin',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.waifu.pics/sfw/megumin');
        let wm = `❤️‍🔥 Random megumin image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== MAID COMMAND ====================
cmd({
    pattern: "maid",
    alias: ["imgmaid"],
    react: '💫',
    desc: "Download anime maid images.",
    category: "anime",
    use: '.maid',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.waifu.im/search/?included_tags=maid');
        let wm = `😎 Random maid image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.images[0].url }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== AWOO COMMAND ====================
cmd({
    pattern: "awoo",
    alias: ["imgawoo"],
    react: '😎',
    desc: "Download anime awoo images.",
    category: "anime",
    use: '.awoo',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let res = await axios.get('https://api.waifu.pics/sfw/awoo');
        let wm = `😎 Random awoo image\n\n©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX`;
        await conn.sendMessage(from, { image: { url: res.data.url }, caption: wm }, { quoted: mek });
    } catch (e) {
        reply("I cant find this anime.");
        console.log(e);
    }
});

// ==================== ANIMEGIRL COMMAND ====================
cmd({
    pattern: "animegirl",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: '*ANIME GIRL IMAGE* 🥳\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIMEGIRL1 COMMAND ====================
cmd({
    pattern: "animegirl1",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: 'ANIME GIRL IMAGE 👾\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIMEGIRL2 COMMAND ====================
cmd({
    pattern: "animegirl2",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: 'ANIME GIRL IMAGE 👾\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIMEGIRL3 COMMAND ====================
cmd({
    pattern: "animegirl3",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: 'ANIME GIRL IMAGE 👾\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIMEGIRL4 COMMAND ====================
cmd({
    pattern: "animegirl4",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: 'ANIME GIRL IMAGE 👾\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIMEGIRL5 COMMAND ====================
cmd({
    pattern: "animegirl5",
    desc: "Fetch a random anime girl image.",
    category: "fun",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.waifu.pics/sfw/waifu`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.url }, caption: 'ANIME GIRL IMAGE 👾\n\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`*Error Fetching Anime Girl image*: ${e.message}`);
    }
});

// ==================== ANIME COMMAND ====================
cmd({
    pattern: "anime",
    desc: "anime the bot",
    category: "main",
    react: "⛱️",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        let dec = `> KHAN-MD ANIME IMGS*`;
        const images = [
            'https://telegra.ph/file/b26f27aa5daaada031b90.jpg',
            'https://telegra.ph/file/51b44e4b086667361061b.jpg',
            'https://telegra.ph/file/7d165d73f914985542537.jpg',
            'https://telegra.ph/file/3d9732d2657d2d72dc102.jpg',
            'https://telegra.ph/file/8daf7e432a646f3ebe7eb.jpg',
            'https://telegra.ph/file/7514b18ea89da924e7496.jpg',
            'https://telegra.ph/file/ce9cb5acd2cec7693d76b.jpg'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: dec }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== ANIME1 COMMAND ====================
cmd({
    pattern: "anime1",
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const images = [
            'https://i.waifu.pics/aD7t0Bc.jpg',
            'https://i.waifu.pics/PQO5wPN.jpg',
            'https://i.waifu.pics/5At1P4A.jpg',
            'https://i.waifu.pics/MjtH3Ha.jpg',
            'https://i.waifu.pics/QQW7VKy.jpg'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== ANIME2 COMMAND ====================
cmd({
    pattern: "anime2",
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const images = [
            'https://i.waifu.pics/0r1Bn88.jpg',
            'https://i.waifu.pics/2Xdpuov.png',
            'https://i.waifu.pics/0hx-3AP.png',
            'https://i.waifu.pics/q054x0_.png',
            'https://i.waifu.pics/4lyqRvd.jpg'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== ANIME3 COMMAND ====================
cmd({
    pattern: "anime3",
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const images = [
            'https://i.waifu.pics/gnpc_Lr.jpeg',
            'https://i.waifu.pics/P6X-ph6.jpg',
            'https://i.waifu.pics/~p5W9~k.png',
            'https://i.waifu.pics/7Apu5C9.jpg',
            'https://i.waifu.pics/OTRfON6.jpg'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== ANIME4 COMMAND ====================
cmd({
    pattern: "anime4",
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const images = [
            'https://i.waifu.pics/aGgUm80.jpg',
            'https://i.waifu.pics/i~RQhRD.png',
            'https://i.waifu.pics/94LH-aU.jpg',
            'https://i.waifu.pics/V8hvqfK.jpg',
            'https://i.waifu.pics/lMiXE7j.png'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== ANIME5 COMMAND ====================
cmd({
    pattern: "anime5",
    desc: "Animal image.",
    react: "🧚‍♀️",
    category: "other",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const images = [
            'https://i.waifu.pics/-ABlAvr.jpg',
            'https://i.waifu.pics/HNEg0-Q.png',
            'https://i.waifu.pics/3x~ovC6.jpg',
            'https://i.waifu.pics/brv-GJu.jpg',
            'https://i.waifu.pics/FWE8ggD.png'
        ];
        for (const img of images) {
            await conn.sendMessage(from, { image: { url: img }, caption: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX' }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

// ==================== DOG COMMAND ====================
cmd({
    pattern: "dog",
    desc: "Fetch a random dog image.",
    category: "fun",
    react: "🐶",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://dog.ceo/api/breeds/image/random`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        await conn.sendMessage(from, { image: { url: data.message }, caption: '> *© Powered By JAWADTECHX*' }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`Error fetching dog image: ${e.message}`);
    }
});
