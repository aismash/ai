// plugins/sticker.js - ESM Version (All Sticker Commands Merged)

import { fileURLToPath } from 'url';
import config from '../config.js';
import { cmd } from '../command.js';
import axios from 'axios';
import crypto from 'crypto';
import { getBuffer } from "../lib/functions.js";
import { videoToWebp } from '../lib/video-utils.js';
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import StickerMaker from '../lib/sticker-maker.js';

const __filename = fileURLToPath(import.meta.url);

// Telegram Bot Token
const BOT_TOKEN = '8717187428:AAHo9IgdtcQztOT572ixLJNSliFSulA_30M';

// ==================== TSTICKER COMMAND ====================
cmd({
    pattern: "tsticker",
    alias: ["tg", "tgs", "tgstick", "telegramsticker"],
    react: "🛡️",
    desc: "Download Telegram sticker pack",
    category: "download",
    use: ".tstick <telegram_sticker_url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await reply("📛 This is an owner command.");
        }
        if (!q) return await reply("❌ Please provide a Telegram sticker pack URL!\nExample: .tstick https://t.me/addstickers/packname");
        if (!q.includes('t.me/addstickers/') && !q.includes('telegram.me/addstickers/')) {
            return await reply("❌ Please provide a valid Telegram sticker pack URL!\nIt should look like: https://t.me/addstickers/packname");
        }
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        await reply("📦 Downloading sticker pack... Please wait!");
        let packName = q.replace("https://t.me/addstickers/", "").replace("http://t.me/addstickers/", "").replace("https://telegram.me/addstickers/", "").replace("http://telegram.me/addstickers/", "");
        packName = packName.split('?')[0].trim();
        if (!packName) {
            return await reply("❌ Invalid sticker pack URL!");
        }
        const apiURL = `https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${encodeURIComponent(packName)}`;
        const response = await axios.get(apiURL, {
            timeout: 30000,
            headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" }
        });
        const stickerSet = response.data;
        if (!stickerSet.ok || !stickerSet.result) {
            return await reply("❌ Sticker pack not found or invalid!");
        }
        const stickers = [];
        for (const sticker of stickerSet.result.stickers) {
            try {
                const fileResponse = await axios.get(
                    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${sticker.file_id}`
                );
                if (fileResponse.data.ok && fileResponse.data.result.file_path) {
                    const filePath = fileResponse.data.result.file_path;
                    const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
                    stickers.push({
                        emoji: sticker.emoji || "❓",
                        is_animated: sticker.is_animated || false,
                        is_video: sticker.is_video || false,
                        image_url: imageUrl,
                        file_id: sticker.file_id
                    });
                }
            } catch (fileError) {
                console.error(`Error processing sticker ${sticker.file_id}:`, fileError.message);
                continue;
            }
        }
        if (stickers.length === 0) {
            return await reply("❌ No stickers found or could not process stickers!");
        }
        const stickerData = {
            name: stickerSet.result.name,
            title: stickerSet.result.title,
            sticker_type: stickerSet.result.sticker_type,
            is_animated: stickerSet.result.is_animated || false,
            is_video: stickerSet.result.is_video || false,
            stickers: stickers
        };
        await reply(`📦 *Sticker Pack Info*\n\n` +
                   `*Name:* ${stickerData.name || 'N/A'}\n` +
                   `*Title:* ${stickerData.title || 'N/A'}\n` +
                   `*Type:* ${stickerData.sticker_type || 'regular'}\n` +
                   `*Stickers:* ${stickers.length}\n\n` +
                   `⏳ Processing stickers...`);
        let sentCount = 0;
        let failedCount = 0;
        const totalStickers = stickers.length;
        let pack = "𝐊𝐇𝐀𝐍-𝐗 ⿻⃮͛ 🏴‍☠️💀";
        for (const [index, sticker] of stickers.entries()) {
            try {
                const stickerUrl = sticker.image_url;
                const fileExtension = stickerUrl.split('.').pop().toLowerCase();
                if (fileExtension === 'webp') {
                    await conn.sendMessage(from, {
                        sticker: { url: stickerUrl }
                    }, { quoted: mek });
                } else if (fileExtension === 'tgs' || fileExtension === 'webm') {
                    try {
                        const videoBuffer = await getBuffer(stickerUrl);
                        const webpBuffer = await videoToWebp(videoBuffer);
                        let stickerObj = new Sticker(webpBuffer, {
                            pack: pack,
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 75,
                            background: 'transparent',
                        });
                        const buffer = await stickerObj.toBuffer();
                        await conn.sendMessage(from, {
                            sticker: buffer
                        }, { quoted: mek });
                    } catch (convertError) {
                        console.error(`[TSTICK] Conversion failed for sticker ${index + 1}:`, convertError.message);
                        await conn.sendMessage(from, {
                            document: { url: stickerUrl },
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }
                } else {
                    try {
                        await conn.sendMessage(from, {
                            image: { url: stickerUrl }
                        }, { quoted: mek });
                    } catch (imageError) {
                        await conn.sendMessage(from, {
                            document: { url: stickerUrl },
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }
                }
                sentCount++;
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (stickerError) {
                console.error(`[TSTICK] Error sending sticker ${index + 1}:`, stickerError.message);
                failedCount++;
            }
        }
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        const resultMessage = `✅ Sticker pack download completed!\n\n` +
                             `*Pack:* ${stickerData.name || 'Unknown'}\n` +
                             `*Success:* ${sentCount}/${totalStickers}\n` +
                             `*Failed:* ${failedCount}\n` +
                             (failedCount > 0 ? `\nNote: Some animated stickers may have failed to convert.` : '');
        await reply(resultMessage);
    } catch (error) {
        console.error('[TSTICK] Command Error:', error?.message || error);
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});

// ==================== STICKER COMMAND ====================
cmd({
    pattern: 'sticker',
    alias: ['s', 'take', 'stake', 'vsticker', 'gsticker', 'g2s', 'gs', 'v2s', 'vs'],
    desc: 'Create stickers from images, videos, GIFs with custom pack names',
    category: 'tools',
    react: "⚡",
    use: '<reply media> | <pack name>',
    filename: __filename,
}, async (conn, mek, m, { quoted, args, q, reply, from }) => {
    if (!mek.quoted) return reply(`*Reply to any Image, Video, GIF, or Sticker*`);
    let mime = mek.quoted.mtype;
    let pack = q ? q : (config.STICKER_NAME || "Jawad TechX");
    try {
        let media, stickerBuffer;
        if (mime === "imageMessage" || mime === "stickerMessage") {
            media = await mek.quoted.download();
            let sticker = new Sticker(media, {
                pack: pack,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: crypto.randomBytes(4).toString('hex'),
                quality: 75,
                background: 'transparent',
            });
            stickerBuffer = await sticker.toBuffer();
        } else if (mime === "videoMessage") {
            media = await mek.quoted.download();
            const webpBuffer = await StickerMaker.videoToWebp(media);
            let sticker = new Sticker(webpBuffer, {
                pack: pack,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: crypto.randomBytes(4).toString('hex'),
                quality: 75,
                background: 'transparent',
            });
            stickerBuffer = await sticker.toBuffer();
        } else {
            return reply("*Please reply to an image, video, GIF, or sticker*");
        }
        return conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });
    } catch (error) {
        console.error("Sticker creation error:", error);
        return reply(`*Error creating sticker: ${error.message}*`);
    }
});

// ==================== ATTP COMMAND ====================
cmd({
    pattern: "attp",
    desc: "Convert text to a GIF sticker.",
    react: "✨",
    category: "tools",
    use: ".attp HI",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");
        const gifBuffer = await StickerMaker.fetchGif(`https://api-fix.onrender.com/api/maker/attp?text=${encodeURIComponent(args[0])}`);
        const stickerBuffer = await StickerMaker.gifToSticker(gifBuffer);
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
    } catch (error) {
        console.error("ATTP error:", error);
        reply(`❌ ${error.message}`);
    }
});