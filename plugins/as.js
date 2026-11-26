// plugins/audiosticker.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import { randomBytes } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import webp from 'node-webpmux';
import {
    proto,
    prepareWAMessageMedia,
    downloadMediaMessage,
    normalizeMessageContent
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const run = promisify(execFile);

// ==================== DISK SESSIONS ====================
const MAX_SEC = 25;
const SESSION_SEC = 30;
const SESSION_DIR = path.join(process.cwd(), 'storage', 'audiosticker');

function sessionPath(key) {
    return path.join(SESSION_DIR, key.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json');
}

async function getSession(key) {
    try {
        const raw = await fs.readFile(sessionPath(key), 'utf-8');
        const s = JSON.parse(raw);
        if (Date.now() - s.createdAt > SESSION_SEC * 1000) {
            await delSession(key); // instant cleanup on expiry
            return null;
        }
        return s;
    } catch {
        return null;
    }
}

async function setSession(key, data) {
    await fs.mkdir(SESSION_DIR, { recursive: true });
    await fs.writeFile(sessionPath(key), JSON.stringify({ ...data, createdAt: Date.now() }));
}

/**
 * Instantly delete a session and its sticker file.
 * Safe to call multiple times.
 */
async function delSession(key) {
    const sp = sessionPath(key);
    try {
        const raw = await fs.readFile(sp, 'utf-8');
        const s = JSON.parse(raw);
        if (s?.stickerPath) await fs.unlink(s.stickerPath).catch(() => {});
    } catch {}
    await fs.unlink(sp).catch(() => {});
}

/**
 * Wipe the whole temp storage dir instantly.
 * Runs after every send (or on error), so nothing lingers.
 */
async function cleanStorage() {
    try {
        const files = await fs.readdir(SESSION_DIR).catch(() => []);
        if (!files.length) return;
        await Promise.all(files.map((f) =>
            fs.unlink(path.join(SESSION_DIR, f)).catch(() => {})
        ));
    } catch {}
}

// ==================== FFMPEG ====================
let ffmpegBin = null;
async function getFfmpeg() {
    if (ffmpegBin) return ffmpegBin;
    try { await run('ffmpeg', ['-version']); ffmpegBin = 'ffmpeg'; return ffmpegBin; } catch {}
    try { const p = (await import('ffmpeg-static')).default; if (p) { ffmpegBin = p; return ffmpegBin; } } catch {}
    throw new Error('ffmpeg not found (install ffmpeg or run npm i ffmpeg-static).');
}

async function ff(input, inExt, outExt, args) {
    const id = randomBytes(6).toString('hex');
    const inFile = path.join(os.tmpdir(), `as_${id}.${inExt}`);
    const outFile = path.join(os.tmpdir(), `as_${id}_out.${outExt}`);
    try {
        await fs.writeFile(inFile, input);
        const { stderr } = await run(await getFfmpeg(), ['-y', '-i', inFile, ...args, outFile], { maxBuffer: 1024 * 1024 * 32 });
        return { data: await fs.readFile(outFile), stderr };
    } finally {
        // temp files removed immediately after each ffmpeg run
        await fs.unlink(inFile).catch(() => {});
        await fs.unlink(outFile).catch(() => {});
    }
}

// ==================== MEDIA ====================
const KINDS = { stickerMessage: 'sticker', imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio' };

function pick(content, download) {
    if (!content) return null;
    for (const [type, kind] of Object.entries(KINDS)) {
        const body = content[type];
        if (body) return { kind, seconds: Number(body.seconds || 0), animated: Boolean(body.isAnimated), download };
    }
    return null;
}

function getMedia(sock, msg) {
    const dl = (m) => downloadMediaMessage(m, 'buffer', {}, {
        logger: sock.logger || console,
        reuploadRequest: sock.updateMediaMessage
    });
    const content = normalizeMessageContent(msg.message);
    const own = pick(content, () => dl(msg));
    const info = Object.values(content || {})
        .map((v) => v && typeof v === 'object' && v.contextInfo)
        .find((c) => c && c.quotedMessage);
    const quoted = info?.quotedMessage
        ? pick(normalizeMessageContent(info.quotedMessage), () =>
            dl({ key: { remoteJid: msg.key.remoteJid, id: info.stanzaId, participant: info.participant }, message: info.quotedMessage }))
        : null;
    return own || quoted;
}

// ==================== STICKER / AUDIO ====================
const SCALE = 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1';

async function videoToWebp(buffer) {
    let out;
    for (const [fps, q] of [[10, 50], [8, 36], [6, 24], [5, 16]]) {
        out = (await ff(buffer, 'mp4', 'webp', ['-t', String(MAX_SEC), '-vf', `fps=${fps},${SCALE}`, '-c:v', 'libwebp', '-lossless', '0', '-compression_level', '6', '-q:v', String(q), '-loop', '0', '-preset', 'picture', '-an'])).data;
        if (out.length <= 880 * 1024) break;
    }
    if (out.length > 1024 * 1024) throw new Error('Video is too long or too detailed for a sticker. Use a shorter clip.');
    return out;
}

async function imageToWebp(buffer) {
    return (await ff(buffer, 'jpg', 'webp', ['-vf', SCALE, '-c:v', 'libwebp', '-lossless', '0', '-q:v', '80', '-an'])).data;
}

async function toSticker(buffer, kind, pack, author) {
    let data = buffer;
    if (kind === 'video') data = await videoToWebp(buffer);
    else if (kind === 'image') data = await imageToWebp(buffer);

    const json = { 'sticker-pack-id': 'com.rahman.audiosticker', 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: ['🎬'] };
    const head = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const body = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([head, body]);
    exif.writeUIntLE(body.length, 14, 4);

    const img = new webp.Image();
    await img.load(data);
    img.exif = exif;
    return await img.save(null);
}

async function toAudioMessage(sock, buffer, ext, fallbackSec = 0) {
    const { data, stderr } = await ff(buffer, ext, 'ogg', ['-vn', '-map', '0:a:0', '-t', String(MAX_SEC), '-af', 'aresample=48000:async=1:first_pts=0', '-c:a', 'libopus', '-b:a', '48k', '-vbr', 'on', '-compression_level', '10', '-ac', '1', '-ar', '48000', '-application', 'audio', '-avoid_negative_ts', 'make_zero', '-f', 'ogg']);
    if (data.length < 200) throw new Error('Audio is empty or too short.');

    const times = [...stderr.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)].pop();
    const real = times ? +times[1] * 3600 + +times[2] * 60 + +times[3] : 0;

    const { audioMessage } = await prepareWAMessageMedia({ audio: data, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { upload: sock.waUploadToServer });
    audioMessage.seconds = Math.max(1, Math.min(MAX_SEC, Math.round(real || fallbackSec || 5)));
    audioMessage.ptt = true;
    audioMessage.mimetype = 'audio/ogg; codecs=opus';
    if (!audioMessage.waveform?.length) audioMessage.waveform = Buffer.from(Array.from({ length: 64 }, (_, i) => 18 + (data[(i * 19 + 7) % data.length] % 76)));
    return audioMessage;
}

// ==================== SEND AUDIO STICKER ====================
async function sendAudioSticker(sock, chat, sticker, animated, audioMsg) {
    patchProto(proto);
    const prepared = await prepareWAMessageMedia({ sticker, isAnimated: animated }, { upload: sock.waUploadToServer });
    prepared.stickerMessage.isAnimated = Boolean(animated);
    prepared.stickerMessage.audioMessage = audioMsg;

    await sock.relayMessage(chat, {
        __proto__: prepared,
        audioStickerMessage: { message: prepared },
        messageContextInfo: { messageSecret: randomBytes(32) }
    }, {});
}

function patchProto(proto) {
    const M = proto?.Message;
    if (!M || M.__audiostickerPatched) return;

    if (M.StickerMessage) {
        const encode = M.StickerMessage.encode;
        M.StickerMessage.encode = function (message, writer) {
            const audio = message?.audioMessage;
            if (audio) delete message.audioMessage;
            const w = encode.call(this, message, writer);
            if (audio && M.AudioMessage) {
                message.audioMessage = audio;
                M.AudioMessage.encode(audio, w.uint32(210).fork()).ldelim();
            }
            return w;
        };

        const fromObject = M.StickerMessage.fromObject;
        if (typeof fromObject === 'function') {
            M.StickerMessage.fromObject = function (object) {
                const msg = fromObject.call(this, object);
                if (object?.audioMessage) msg.audioMessage = M.AudioMessage?.fromObject ? M.AudioMessage.fromObject(object.audioMessage) : object.audioMessage;
                return msg;
            };
        }
    }

    const encode = M.encode;
    M.encode = function (message, writer) {
        const asm = message?.audioStickerMessage;
        if (asm) {
            delete message.stickerMessage;
            delete message.audioStickerMessage;
        }
        let w;
        try {
            w = encode.call(this, message, writer);
        } finally {
            if (asm) message.audioStickerMessage = asm;
        }
        if (asm && M.FutureProofMessage) M.FutureProofMessage.encode(asm, w.uint32(1074).fork()).ldelim();
        return w;
    };

    const fromObject = M.fromObject;
    if (typeof fromObject === 'function') {
        M.fromObject = function (object) {
            const msg = fromObject.call(this, object);
            if (object?.audioStickerMessage) {
                const inner = object.audioStickerMessage.message || object.audioStickerMessage;
                if (inner?.stickerMessage && object.audioStickerMessage.message?.stickerMessage?.audioMessage) {
                    inner.stickerMessage.audioMessage = object.audioStickerMessage.message.stickerMessage.audioMessage;
                }
                msg.audioStickerMessage = { message: inner };
                delete msg.stickerMessage;
                if (inner) Object.setPrototypeOf(msg, inner);
            }
            return msg;
        };
    }

    M.__audiostickerPatched = true;
}

// ==================== COMMAND ====================
cmd({
    pattern: "audiosticker",
    alias: ["as"],
    react: "🎬",
    desc: "Create audio stickers from video/image + audio",
    category: "tools",
    use: "<reply media> | pack|author",
    filename: __filename
}, async (client, message, m, { from, args, reply, sender, botData, prefix }) => {
    const key = `${from}:${sender || from}`;
    const arg = (args || []).join(' ').trim();
    const cmdText = (prefix || '.') + 'audiosticker';
    const react = (emoji) => client.sendMessage(from, { react: { text: emoji, key: message.key } }).catch(() => {});

    try {
        const media = getMedia(client, message);
        const session = await getSession(key);

        // Session + audio/video arrived → attach and send
        if (session && (media?.kind === 'audio' || media?.kind === 'video')) {
            await react('⏳');
            const stickerBuffer = await fs.readFile(session.stickerPath);
            const audio = await toAudioMessage(client, await media.download(), media.kind === 'video' ? 'mp4' : 'ogg', media.seconds);
            await sendAudioSticker(client, from, stickerBuffer, session.animated, audio);
            await react('✅');
            // 🔥 instant cleanup right after sending
            await delSession(key);
            await cleanStorage();
            return;
        }

        if (!media) {
            return reply(
                `🎬 ᴀᴜᴅɪᴏ sᴛɪᴄᴋᴇʀ\n\n` +
                `🎬 sᴇɴᴅ / ʀᴇᴘʟʏ ᴀ ᴠɪᴅᴇᴏ ᴡɪᴛʜ ${cmdText}\n` +
                `↳ ᴄʀᴇᴀᴛᴇs ᴛʜᴇ ᴀᴜᴅɪᴏ sᴛɪᴄᴋᴇʀ ɪɴsᴛᴀɴᴛʟʏ\n` +
                `🖼️ sᴇɴᴅ / ʀᴇᴘʟʏ ᴀ ᴘʜᴏᴛᴏ ᴏʀ sᴛɪᴄᴋᴇʀ ᴡɪᴛʜ ${cmdText}\n` +
                `↳ ᴛʜᴇɴ ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀᴜᴅɪᴏ / ᴠɴ (ᴍᴀx ${SESSION_SEC} sᴇᴄs)\n` +
                `⚙️ ᴘᴀᴄᴋ ɴᴀᴍᴇ: ${cmdText} Pack|Author`
            );
        }

        if (media.kind === 'audio') {
            return reply(`🖼️ sᴇɴᴅ ᴀ ᴘʜᴏᴛᴏ / sᴛɪᴄᴋᴇʀ ғɪʀsᴛ ᴡɪᴛʜ ${cmdText},\nᴛʜᴇɴ ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ᴀᴜᴅɪᴏ.`);
        }

        await react('⏳');
        let [pack, author] = arg.split('|').map((v) => v.trim());
        pack = pack || botData?.botName || config.STICKER_NAME || 'ʀᴀʜᴍᴀɴ-ᴍᴅ';
        author = author || config.STICKER_AUTHOR || 'ʀᴀʜᴍᴀɴ ᴛᴇᴄʜ';

        const buffer = await media.download();
        const sticker = await toSticker(buffer, media.kind, pack, author);
        const animated = media.kind === 'video' || (media.kind === 'sticker' && media.animated);

        // Video with audio → instant send
        if (media.kind === 'video') {
            try {
                const audio = await toAudioMessage(client, buffer, 'mp4', media.seconds);
                await sendAudioSticker(client, from, sticker, true, audio);
                await react('✅');
                // 🔥 instant cleanup (nothing was written to storage, but safe)
                await cleanStorage();
                return;
            } catch (e) {
                console.error('[audiosticker] video without audio, opening session:', String(e.message).split('\n')[0].slice(0, 120));
            }
        }

        // Save sticker to disk, start session
        await delSession(key);
        await fs.mkdir(SESSION_DIR, { recursive: true });
        const stickerPath = path.join(SESSION_DIR, `sticker_${randomBytes(6).toString('hex')}.webp`);
        await fs.writeFile(stickerPath, sticker);
        await setSession(key, { stickerPath, animated });

        await react('🖼️');
        return reply(
            `✅ sᴛɪᴄᴋᴇʀ sᴇssɪᴏɴ ᴀᴄᴛɪᴠᴇ\n\n` +
            `⏱️ ᴛɪᴍᴇ: ${SESSION_SEC} sᴇᴄs\n` +
            `🎙️ ɴᴏᴡ ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ / ᴀᴜᴅɪᴏ / ᴠɪᴅᴇᴏ ᴜsɪɴɢ ${cmdText}`
        );

    } catch (e) {
        console.error('[audiosticker] Error:', e.message);
        await react('❌');
        // 🔥 always clean on error too
        await cleanStorage().catch(() => {});
        await reply(`❌ ғᴀɪʟᴇᴅ:\n${String(e.message || e).split('\n')[0].slice(0, 200)}`).catch(() => {});
    }
});
