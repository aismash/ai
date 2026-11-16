import { fileURLToPath } from 'url';
import { proto } from '@whiskeysockets/baileys';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== HELPER: RESOLVE CHANNEL LINK ====================
async function resolveChannelLink(client, link) {
    const m = link.match(/whatsapp\.com\/channel\/([\w-]+)/i);
    if (!m) return null;
    try {
        const metadata = await client.newsletterMetadata("invite", m[1]);
        return metadata?.id || null;
    } catch { return null; }
}

// ==================== HELPER: GENERATE TRACE ID ====================
const TRACE_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateTraceId() {
    let id = '';
    for (let i = 0; i < 24; i++) {
        id += TRACE_ID_ALPHABET[Math.floor(Math.random() * TRACE_ID_ALPHABET.length)];
    }
    return id;
}

// ==================== HELPER: EXTRACT RAW CONTENT ====================
// The official Baileys logic for extracting whitelisted fields to create a valid report token.
const reportingFields = [
	{ f: 1 }, { f: 3, s: [{ f: 2 }, { f: 3 }, { f: 8 }, { f: 11 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 25 }] },
	{ f: 4, s: [{ f: 1 }, { f: 16 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 5, s: [{ f: 3 }, { f: 4 }, { f: 5 }, { f: 16 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 6, s: [{ f: 1 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 30 }] },
	{ f: 7, s: [{ f: 2 }, { f: 7 }, { f: 10 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 20 }] },
	{ f: 8, s: [{ f: 2 }, { f: 7 }, { f: 9 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 21 }] },
	{ f: 9, s: [{ f: 2 }, { f: 6 }, { f: 7 }, { f: 13 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 20 }] },
	{ f: 12, s: [{ f: 1 }, { f: 2 }, { f: 14, m: true }, { f: 15 }] },
	{ f: 18, s: [{ f: 6 }, { f: 16 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 26, s: [{ f: 4 }, { f: 5 }, { f: 8 }, { f: 13 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 28, s: [{ f: 1 }, { f: 2 }, { f: 4 }, { f: 5 }, { f: 6 }, { f: 7, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 37, s: [{ f: 1, m: true }] },
	{ f: 49, s: [{ f: 2 }, { f: 3, s: [{ f: 1 }, { f: 2 }] }, { f: 5, s: [{ f: 21 }, { f: 22 }] }, { f: 8, s: [{ f: 1 }, { f: 2 }] }] },
	{ f: 53, s: [{ f: 1, m: true }] }, { f: 55, s: [{ f: 1, m: true }] },
	{ f: 58, s: [{ f: 1, m: true }] }, { f: 59, s: [{ f: 1, m: true }] },
	{ f: 60, s: [{ f: 2 }, { f: 3, s: [{ f: 1 }, { f: 2 }] }, { f: 5, s: [{ f: 21 }, { f: 22 }] }, { f: 8, s: [{ f: 1 }, { f: 2 }] }] },
	{ f: 64, s: [{ f: 2 }, { f: 3, s: [{ f: 1 }, { f: 2 }] }, { f: 5, s: [{ f: 21 }, { f: 22 }] }, { f: 8, s: [{ f: 1 }, { f: 2 }] }] },
	{ f: 66, s: [{ f: 2 }, { f: 6 }, { f: 7 }, { f: 13 }, { f: 17, s: [{ f: 21 }, { f: 22 }] }, { f: 20 }] },
	{ f: 74, s: [{ f: 1, m: true }] }, { f: 87, s: [{ f: 1, m: true }] },
	{ f: 88, s: [{ f: 1 }, { f: 2, s: [{ f: 1 }] }, { f: 3, s: [{ f: 21 }, { f: 22 }] }] },
	{ f: 92, s: [{ f: 1, m: true }] }, { f: 93, s: [{ f: 1, m: true }] }, { f: 94, s: [{ f: 1, m: true }] }
];

const compileReportingFields = (fields) => {
	const map = new Map();
	for (const f of fields) {
		map.set(f.f, { m: f.m, children: f.s ? compileReportingFields(f.s) : undefined });
	}
	return map;
};
const compiledReportingFields = compileReportingFields(reportingFields);
const EMPTY_MAP = new Map();
const WIRE = { VARINT: 0, FIXED64: 1, BYTES: 2, FIXED32: 5 };

const extractReportingTokenContent = (data, cfg) => {
	const out = [];
	let i = 0;
	while (i < data.length) {
		const tag = decodeVarint(data, i);
		if (!tag.ok) return null;
		const fieldNum = tag.value >> 3;
		const wireType = tag.value & 0x7;
		const fieldStart = i;
		i += tag.bytes;
		const fieldCfg = cfg.get(fieldNum);
		const pushSlice = (end) => {
			if (end > data.length) return false;
			out.push({ num: fieldNum, bytes: data.subarray(fieldStart, end) });
			i = end;
			return true;
		};
		const skip = (end) => {
			if (end > data.length) return false;
			i = end;
			return true;
		};
		if (wireType === WIRE.VARINT) {
			const v = decodeVarint(data, i);
			if (!v.ok) return null;
			const end = i + v.bytes;
			if (!fieldCfg) { if (!skip(end)) return null; continue; }
			if (!pushSlice(end)) return null;
			continue;
		}
		if (wireType === WIRE.FIXED64) {
			const end = i + 8;
			if (!fieldCfg) { if (!skip(end)) return null; continue; }
			if (!pushSlice(end)) return null;
			continue;
		}
		if (wireType === WIRE.FIXED32) {
			const end = i + 4;
			if (!fieldCfg) { if (!skip(end)) return null; continue; }
			if (!pushSlice(end)) return null;
			continue;
		}
		if (wireType === WIRE.BYTES) {
			const len = decodeVarint(data, i);
			if (!len.ok) return null;
			const valStart = i + len.bytes;
			const valEnd = valStart + len.value;
			if (valEnd > data.length) return null;
			if (!fieldCfg) { i = valEnd; continue; }
			if (fieldCfg.m || fieldCfg.children) {
				const sub = extractReportingTokenContent(data.subarray(valStart, valEnd), fieldCfg.children ?? EMPTY_MAP);
				if (sub === null) return null;
				if (sub.length > 0) {
					const newTag = encodeVarint(tag.value);
					const newLen = encodeVarint(sub.length);
					out.push({ num: fieldNum, bytes: Buffer.concat([newTag, newLen, sub]) });
				}
				i = valEnd;
				continue;
			}
			out.push({ num: fieldNum, bytes: data.subarray(fieldStart, valEnd) });
			i = valEnd;
			continue;
		}
		return null;
	}
	if (out.length === 0) return Buffer.alloc(0);
	out.sort((a, b) => a.num - b.num);
	return Buffer.concat(out.map(f => f.bytes));
};

const decodeVarint = (buffer, offset) => {
	let value = 0, bytes = 0, shift = 0;
	while (offset + bytes < buffer.length) {
		const current = buffer[offset + bytes];
		value |= (current & 0x7f) << shift;
		bytes++;
		if ((current & 0x80) === 0) return { value, bytes, ok: true };
		shift += 7;
		if (shift > 35) return { value: 0, bytes: 0, ok: false };
	}
	return { value: 0, bytes: 0, ok: false };
};

const encodeVarint = (value) => {
	const parts = [];
	let remaining = value >>> 0;
	while (remaining > 0x7f) {
		parts.push((remaining & 0x7f) | 0x80);
		remaining >>>= 7;
	}
	parts.push(remaining);
	return Buffer.from(parts);
};

// ==================== CHANNEL REPORT COMMAND ====================
cmd({
    pattern: "chreport",
    alias: ["reportch", "rch"],
    react: '🚨',
    desc: "Report a WhatsApp Channel (Newsletter)",
    category: "owner",
    filename: __filename
}, async (client, message, m, { isCreator, text, reply }) => {
    try {
        if (!isCreator) {
            return await reply("*📛 This is an owner command.*");
        }

        const args = text.split(' ');
        let channelInput = args[0];

        if (!channelInput) {
            return await reply("⚠️ *Usage:*\n`.chreport <channel_link_or_jid>`\n\n*Example:*\n`.chreport https://whatsapp.com/channel/xxxx`\n\n_Reply to a message from the channel to report that specific message._");
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

        // 2. Extract Quoted Message (if exists)
        let reportMessage = null;
        if (m.quoted && m.msg?.contextInfo?.quotedMessage) {
            reportMessage = {
                key: {
                    remoteJid: channelJid,
                    fromMe: false,
                    id: m.msg.contextInfo.stanzaId || generateTraceId(),
                    participant: m.msg.contextInfo.participant
                },
                messageTimestamp: Math.floor(Date.now() / 1000),
                message: m.msg.contextInfo.quotedMessage
            };
        } else {
            reportMessage = {
                key: {
                    remoteJid: channelJid,
                    fromMe: false,
                    id: generateTraceId(),
                },
                messageTimestamp: Math.floor(Date.now() / 1000),
                message: { conversation: "Reporting channel" }
            };
        }

        await reply("⏳ Sending report to WhatsApp...");

        // 3. Build the Spam Report IQ manually (matching buildSpamReportNode logic)
        const traceId = generateTraceId();
        const rawBytes = reportMessage.message ? extractReportingTokenContentForMessage(Buffer.from(proto.Message.encode(reportMessage.message).finish())) : null;

        const messageContent = [];
        if (rawBytes && rawBytes.length > 0) {
            messageContent.push({
                tag: 'raw',
                attrs: { v: '3' },
                content: rawBytes
            });
        }

        const node = {
            tag: 'iq',
            attrs: {
                xmlns: 'spam',
                to: 's.whatsapp.net',
                type: 'set'
            },
            content: [
                {
                    tag: 'spam_list',
                    attrs: {
                        spam_flow: 'newsletter_info_report',
                        wi_trace_id: traceId,
                        jid: channelJid
                    },
                    content: [
                        {
                            tag: 'message',
                            attrs: {
                                id: reportMessage.key.id,
                                t: String(reportMessage.messageTimestamp),
                                from: channelJid
                            },
                            content: messageContent
                        }
                    ]
                }
            ]
        };

        // 4. Send to WhatsApp
        const response = await client.query(node);

        // 5. Check Response
        if (response?.attrs?.error) {
            throw new Error(`❌ WhatsApp rejected the report (Error ${response.attrs.error})`);
        }

        // Extract report_id if present
        let reportId = 'Unknown';
        if (response?.content) {
            const reportIdNode = response.content.find(n => n.tag === 'report_id');
            if (reportIdNode && reportIdNode.content) {
                reportId = typeof reportIdNode.content === 'string' 
                    ? reportIdNode.content 
                    : reportIdNode.content.toString();
            }
        }

        await reply(`✅ Channel reported successfully!\n\n📝 Report ID: ${reportId}`);

    } catch (error) {
        console.error("Channel Report Error:", error);
        await reply(error.message);
    }
});
