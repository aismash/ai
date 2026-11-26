// plugins/viewonce.js - ESM Version (Official Baileys, self-contained)
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import { downloadMediaMessage, normalizeMessageContent, getContentType } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

// ---- Local helpers (extracted from the mod) ----

const VIEW_ONCE_MEDIA = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    ptvMessage: 'ptv'
};

// Peel wrappers (ephemeral, viewOnce V1/V2/V2Extension, documentWithCaption, edited, etc.)
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

// Detect whether content arrived inside a view-once wrapper (any depth)
const seenViewOnceWrapper = (node, depth = 0) => {
    if (!node || depth > 5) return false;
    if (
        node.viewOnceMessage?.message ||
        node.viewOnceMessageV2?.message ||
        node.viewOnceMessageV2Extension?.message
    ) {
        return true;
    }
    return seenViewOnceWrapper(node.ephemeralMessage?.message, depth + 1);
};

// Pure unwrap + detect: returns { media, mediaType, isViewOnce } or undefined
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
    return { media, mediaType, isViewOnce };
};

// Download with reupload-first when media has key but no URL (mirrors mod behavior)
const downloadViewOnceMessage = async (message, type, options, ctx) => {
    const extracted = extractViewOnceMedia(message.message);
    if (!extracted?.isViewOnce) {
        throw new Error('message is not a view once media message');
    }

    let msg = message;
    const { media } = extracted;

    // No URL and no directPath -> ask sender to re-serve (needs reuploadRequest in ctx)
    if (!media.url && !media.directPath) {
        if (!media.mediaKey || !ctx?.reuploadRequest) {
            throw new Error(
                'view once media has no download URL; pass reuploadRequest (sock.updateMediaMessage) to ask the sender to re-serve it'
            );
        }
        console.log('[vv] no URL, requesting re-upload...');
        msg = await ctx.reuploadRequest(msg);
    }

    return downloadMediaMessage(msg, type, options, ctx);
};

// ---- Command ----

cmd({
    pattern: "vv",
    alias: ["viewonce", "retrive"],
    react: '🐳',
    desc: "Owner Only - retrieve quoted message back to user",
    category: "owner",
    filename: __filename
}, async (client, message, m, {
    from,
    isCreator,
    userConfig
}) => {
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

        // Build a fake WAMessage shape for the download helpers
        const quotedMsg = {
            key: m.quoted.key,
            message: m.quoted.message,
            messageTimestamp: m.quoted.messageTimestamp,
            participant: m.quoted.participant
        };

        // Context for reupload fallback
        const ctx = {
            logger: {
                info: (...a) => console.log('[vv]', ...a),
                warn: (...a) => console.warn('[vv]', ...a)
            },
            reuploadRequest: client.updateMediaMessage
                ? (msg) => client.updateMediaMessage(msg)
                : undefined
        };

        let buffer;
        try {
            buffer = await downloadViewOnceMessage(quotedMsg, 'buffer', {}, ctx);
        } catch (e) {
            // Fallback: plain download (handles non-viewOnce quoted media too)
            buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, ctx);
        }

        const extracted = extractViewOnceMedia(quotedMsg.message);
        const mediaType = extracted?.mediaType || 'image';
        const originalCaption = m.quoted.text || '';
        const options = { quoted: message };

        let messageContent = {};
        switch (mediaType) {
            case "image":
                messageContent = {
                    image: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
                    mimetype: m.quoted.mimetype || "image/jpeg"
                };
                break;
            case "video":
            case "ptv":
                messageContent = {
                    video: buffer,
                    caption: originalCaption ? `${originalCaption}\n\n> ${DESCRIPTION}` : `> ${DESCRIPTION}`,
                    mimetype: m.quoted.mimetype || "video/mp4"
                };
                break;
            case "audio":
                messageContent = {
                    audio: buffer,
                    mimetype: "audio/mp4",
                    ptt: m.quoted.ptt || false
                };
                break;
            case "document":
                messageContent = {
                    document: buffer,
                    mimetype: m.quoted.mimetype || "application/octet-stream",
                    fileName: m.quoted.fileName || "file"
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
