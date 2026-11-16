import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== HELPER: RESOLVE CHANNEL LINK ====================
async function resolveChannelLink(client, link) {
    const m = link.match(/whatsapp\.com\/channel\/([\w-]+)/i);
    if (!m) return null;
    try {
        const metadata = await client.newsletterMetadata("invite", m[1]);
        return metadata;
    } catch { return null; }
}

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

        const channelInput = text.trim();

        if (!channelInput) {
            return await reply("⚠️ *Usage:*\n`.chreport <channel_link>`\n\n*Example:*\n`.chreport https://whatsapp.com/channel/xxxx`");
        }

        // 1. Resolve Channel Link to Metadata
        if (!channelInput.includes('whatsapp.com/channel/')) {
            return await reply("❌ Please provide a valid WhatsApp channel link.");
        }

        const metadata = await resolveChannelLink(client, channelInput);
        if (!metadata) {
            return await reply("❌ Could not resolve that channel link.");
        }

        await reply(`⏳ Reporting channel: *${metadata.name || 'Unknown'}*\nFollowers: ${metadata.subscribers || 'Unknown'}`);

        // 2. Send the correct spam report IQ for a channel
        const response = await client.query({
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
                        wi_trace_id: generateTraceId()
                    },
                    content: [
                        {
                            tag: 'newsletter',
                            attrs: {
                                jid: metadata.id,
                                name: metadata.name || '',
                                subscribers: String(metadata.subscribers || 0)
                            }
                        }
                    ]
                }
            ]
        });

        // 3. Check Response
        if (response?.attrs?.error) {
            throw new Error(`❌ WhatsApp rejected the report (Error ${response.attrs.error})`);
        }

        let reportId = 'Unknown';
        if (response?.content) {
            const reportIdNode = response.content.find(n => n.tag === 'report_id');
            if (reportIdNode && reportIdNode.content) {
                reportId = typeof reportIdNode.content === 'string' 
                    ? reportIdNode.content 
                    : reportIdNode.content.toString();
            }
        }

        if (reportId === 'Unknown') {
            await reply(`⚠️ Report sent, but WhatsApp did not return a Report ID. This usually means the report was queued for review.`);
        } else {
            await reply(`✅ Channel reported successfully!\n\n📝 Report ID: ${reportId}`);
        }

    } catch (error) {
        console.error("Channel Report Error:", error);
        await reply(error.message);
    }
});
