// plugins/viewonce.js - ESM Version (Official Baileys, self-contained)
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

const VIEW_ONCE_MEDIA = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    ptvMessage: 'ptv'
};

const unwrapContent = (content) => {
    if (!content) return undefined;
    for (let i = 0; i < 5; i++) {
        const inner =
            content?.ephemeralMessage ||
            content?.viewOnceMessage ||
            content?.documentWithCaptionMessage ||
            content?.viewOnceMessageV2 ||
            content?.viewOnceMessageV2Extension ||
            content?.editedMessage ||
            content?.associatedChildMessage ||
            content?.groupStatusMessage ||
            content?.groupStatusMessageV2;
        if (!inner) break;
        content = inner.message;
    }
    return content;
};

const seenViewOnceWrapper = (node, depth = 0) => {
    if (!node || depth > 5) return false;
    if (
        node.viewOnceMessage?.message ||
        node.viewOnceMessageV2?.message ||
        node.viewOnceMessageV2Extension?.message
    ) return true;
    return seenViewOnceWrapper(node.ephemeralMessage?.message, depth + 1);
};

const extractViewOnceMedia = (content) => {
    if (!content) return undefined;
    const wrapped = seenViewOnceWrapper(content);
    const inner = unwrapContent(content);
    if (!inner) return undefined;
    const innerType = getContentType(inner);
    if (!innerType) return undefined;
    const mediaType = VIEW_ONCE_MEDIA[innerType];
    if (!mediaType) return undefined;
    const media = inner[innerType];
    const isViewOnce = wrapped || media?.viewOnce === true;
    return { media, mediaType, isViewOnce, contentType: innerType };
};

const downloadViewOnceMessage = async (message, type, options, ctx) => {
    const extracted = extractViewOnceMedia(message.message);
    if (!extracted) throw new Error('No view once media found in message');
    if (!extracted.isViewOnce) throw new Error('Message is not view once');

    let msg = message;
    const { media } = extracted;

    // Stub (no url / directPath / mediaKey) -> must ask sender to re-serve
    if (!media.url && !media.directPath) {
        if (!ctx?.reuploadRequest) {
            throw new Error(
                'View-once media is a stub (no URL, no key). The sender must re-send it. ' +
                'Ensure client.updateMediaMessage is available and the original message is in your store.'
            );
        }
        console.log('[vv] no URL in quoted stub, requesting re-upload...');
        msg = await ctx.reuploadRequest(msg);
        // After reupload, re-extract
        const re = extractViewOnceMedia(msg.message);
        if (!re?.media?.url && !re?.media?.directPath) {
            throw new Error('Sender did not re-serve the media (still no URL).');
        }
    }

    return downloadMediaMessage(msg, type, options, ctx);
};

cmd({
    pattern: "vv",
    alias: ["viewonce", "retrive"],
    react: '🐳',
    desc: "Owner Only - retrieve quoted message back to user",
    category: "owner",
    filename: __filename
}, async (client, message, m, { from, isCreator, userConfig }) => {
    try {
        if (!isCreator) {
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        if (!m.quoted) {
            return await client.sendMessage(from, {
                text: "*🍁 Please reply to a view once message!*"
            }, { quoted: message });
        }

        // ---- Rebuild a proper WAMessage from contextInfo ----
        const ctxInfo = m.msg?.contextInfo || m.quoted?.contextInfo;
        const quotedMessage =
            ctxInfo?.quotedMessage ||
            m.quoted?.message ||
            (m.quoted?.mimetype !== undefined ? { imageMessage: m.quoted } : null);

        if (!quotedMessage) {
            return await client.sendMessage(from, {
                text: "❌ Could not read quoted message content."
            }, { quoted: message });
        }

        const quotedKey = {
            remoteJid: from,
            fromMe: ctxInfo?.participant === client.user?.id?.split(':')[0] + '@s.whatsapp.net'
                ? true
                : false,
            id: ctxInfo?.stanzaId || m.quoted?.id,
            participant: ctxInfo?.participant
        };

        const quotedMsg = {
            key: quotedKey,
            message: quotedMessage,
            messageTimestamp: m.quoted?.messageTimestamp,
            participant: ctxInfo?.participant
        };

        // Logger + reupload ctx
        const ctx = {
            logger: {
                info: (...a) => console.log('[vv]', ...a),
                warn: (...a) => console.warn('[vv]', ...a)
            },
            // Official Baileys: sock.updateMediaMessage re-requests media for a given msg
            reuploadRequest: client.updateMediaMessage
                ? (msg) => client.updateMediaMessage(msg)
                : undefined
        };

        const extracted = extractViewOnceMedia(quotedMessage);
        const mediaType = extracted?.mediaType || 'image';
        const originalCaption = m.quoted?.text || '';

        let buffer;
        try {
            buffer = await downloadViewOnceMessage(quotedMsg, 'buffer', {}, ctx);
        } catch (e1) {
            console.log('[vv] strict path failed:', e1.message);
            try {
                buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, ctx);
            } catch (e2) {
                throw new Error(
                    `Could not download. Strict: ${e1.message} | Fallback: ${e2.message}`
                );
            }
        }

        if (!buffer || !buffer.length) {
            throw new Error('Downloaded buffer is empty.');
        }

        const options = { quoted: message };
        let messageContent = {};

        switch (mediaType) {
            case "image":
                messageContent = {
                    image: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
                    mimetype: m.quoted?.mimetype || "image/jpeg"
                };
                break;
            case "video":
            case "ptv":
                messageContent = {
                    video: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
                    mimetype: m.quoted?.mimetype || "video/mp4"
                };
                break;
            case "audio":
                messageContent = {
                    audio: buffer,
                    mimetype: "audio/mp4",
                    ptt: m.quoted?.ptt || false
                };
                break;
            case "document":
                messageContent = {
                    document: buffer,
                    mimetype: m.quoted?.mimetype || "application/octet-stream",
                    fileName: m.quoted?.fileName || "file"
                };
                break;
            default:
                return await client.sendMessage(from, {
                    text: "❌ Only image, video, audio, and document messages are supported"
                }, { quoted: message });
        }

        await client.sendMessage(from, messageContent, options);
    } catch (error) {
        console.error("vv Error:", error);
        await client.sendMessage(from, {
            text: "❌ Error fetching vv message:\n" + error.message
        }, { quoted: message });
    }
});
