// plugins/font.js - ESM Version (Final combined file)
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { allFonts, convertText } from '../lib/fonts.js';

const __filename = fileURLToPath(import.meta.url);

// ─────────────────────────────────────────────
// Main font command - shows ALL fonts numbered
// ─────────────────────────────────────────────
cmd({
  pattern: "font",
  alias: ["fancy", "stylish", "textstyle"],
  react: "✍️",
  desc: "Convert text into all available fancy fonts",
  category: "tools",
  use: ".font <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  try {
    if (!text) {
      return reply(`✍️ Please provide text to convert\nExample: .font Hello World`);
    }

    let resultText = `✨ *Fancy Fonts Converter* ✨\n\n`;
    let count = 0;

    for (let i = 0; i < allFonts.length; i++) {
      const converted = convertText(text, allFonts[i]);
      if (converted !== text) {
        count++;
        resultText += `${count}. ${converted}\n`;
      }
    }

    resultText += `\n\n> *Powered by JawadTechX*`;

    if (resultText.length > 64000) {
      const chunks = resultText.match(/[\s\S]{1,64000}/g) || [];
      for (const chunk of chunks) {
        await conn.sendMessage(from, { text: chunk }, { quoted: mek });
      }
    } else {
      await conn.sendMessage(from, { text: resultText }, { quoted: mek });
    }
  } catch (error) {
    console.error("❌ Error in font command:", error);
    reply("⚠️ An error occurred while converting fonts. Please try again.");
  }
});

// ─────────────────────────────────────────────
// Fancy command (single style - most popular)
// ─────────────────────────────────────────────
cmd({
  pattern: "fancy",
  alias: ["fanc"],
  react: "✍️",
  desc: "Convert your text into a fancy stylish font",
  category: "tools",
  use: ".fancy <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  try {
    if (!text) {
      return reply(`✍️ Use .fancy <text> to convert your text into stylish font\nExample: .fancy Hello World`);
    }

    const converted = convertText(text, allFonts[0]);
    await conn.sendMessage(from, { text: converted }, { quoted: mek });
  } catch (error) {
    console.error("❌ Error in fancy command:", error);
    reply("⚠️ An error occurred while converting text. Please try again.");
  }
});

// ─────────────────────────────────────────────
// Individual fontN commands (1 - 105)
// ─────────────────────────────────────────────

// Font 1
cmd({
  pattern: "font1",
  alias: ["f1"],
  react: "✍️",
  desc: "Apply font style #1 to your text",
  category: "tools",
  use: ".font1 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #1*\n\nUsage: .font1 <text>\nExample: .font1 hello`);
  const converted = convertText(text, allFonts[0]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 2
cmd({
  pattern: "font2",
  alias: ["f2"],
  react: "✍️",
  desc: "Apply font style #2 to your text",
  category: "tools",
  use: ".font2 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #2*\n\nUsage: .font2 <text>\nExample: .font2 hello`);
  const converted = convertText(text, allFonts[1]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 3
cmd({
  pattern: "font3",
  alias: ["f3"],
  react: "✍️",
  desc: "Apply font style #3 to your text",
  category: "tools",
  use: ".font3 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #3*\n\nUsage: .font3 <text>\nExample: .font3 hello`);
  const converted = convertText(text, allFonts[2]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 4
cmd({
  pattern: "font4",
  alias: ["f4"],
  react: "✍️",
  desc: "Apply font style #4 to your text",
  category: "tools",
  use: ".font4 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #4*\n\nUsage: .font4 <text>\nExample: .font4 hello`);
  const converted = convertText(text, allFonts[3]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 5
cmd({
  pattern: "font5",
  alias: ["f5"],
  react: "✍️",
  desc: "Apply font style #5 to your text",
  category: "tools",
  use: ".font5 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #5*\n\nUsage: .font5 <text>\nExample: .font5 hello`);
  const converted = convertText(text, allFonts[4]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 6
cmd({
  pattern: "font6",
  alias: ["f6"],
  react: "✍️",
  desc: "Apply font style #6 to your text",
  category: "tools",
  use: ".font6 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #6*\n\nUsage: .font6 <text>\nExample: .font6 hello`);
  const converted = convertText(text, allFonts[5]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 7
cmd({
  pattern: "font7",
  alias: ["f7"],
  react: "✍️",
  desc: "Apply font style #7 to your text",
  category: "tools",
  use: ".font7 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #7*\n\nUsage: .font7 <text>\nExample: .font7 hello`);
  const converted = convertText(text, allFonts[6]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 8
cmd({
  pattern: "font8",
  alias: ["f8"],
  react: "✍️",
  desc: "Apply font style #8 to your text",
  category: "tools",
  use: ".font8 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #8*\n\nUsage: .font8 <text>\nExample: .font8 hello`);
  const converted = convertText(text, allFonts[7]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 9
cmd({
  pattern: "font9",
  alias: ["f9"],
  react: "✍️",
  desc: "Apply font style #9 to your text",
  category: "tools",
  use: ".font9 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #9*\n\nUsage: .font9 <text>\nExample: .font9 hello`);
  const converted = convertText(text, allFonts[8]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 10
cmd({
  pattern: "font10",
  alias: ["f10"],
  react: "✍️",
  desc: "Apply font style #10 to your text",
  category: "tools",
  use: ".font10 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #10*\n\nUsage: .font10 <text>\nExample: .font10 hello`);
  const converted = convertText(text, allFonts[9]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 11
cmd({
  pattern: "font11",
  alias: ["f11"],
  react: "✍️",
  desc: "Apply font style #11 to your text",
  category: "tools",
  use: ".font11 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #11*\n\nUsage: .font11 <text>\nExample: .font11 hello`);
  const converted = convertText(text, allFonts[10]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 12
cmd({
  pattern: "font12",
  alias: ["f12"],
  react: "✍️",
  desc: "Apply font style #12 to your text",
  category: "tools",
  use: ".font12 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #12*\n\nUsage: .font12 <text>\nExample: .font12 hello`);
  const converted = convertText(text, allFonts[11]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 13
cmd({
  pattern: "font13",
  alias: ["f13"],
  react: "✍️",
  desc: "Apply font style #13 to your text",
  category: "tools",
  use: ".font13 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #13*\n\nUsage: .font13 <text>\nExample: .font13 hello`);
  const converted = convertText(text, allFonts[12]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 14
cmd({
  pattern: "font14",
  alias: ["f14"],
  react: "✍️",
  desc: "Apply font style #14 to your text",
  category: "tools",
  use: ".font14 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #14*\n\nUsage: .font14 <text>\nExample: .font14 hello`);
  const converted = convertText(text, allFonts[13]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 15
cmd({
  pattern: "font15",
  alias: ["f15"],
  react: "✍️",
  desc: "Apply font style #15 to your text",
  category: "tools",
  use: ".font15 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #15*\n\nUsage: .font15 <text>\nExample: .font15 hello`);
  const converted = convertText(text, allFonts[14]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 16
cmd({
  pattern: "font16",
  alias: ["f16"],
  react: "✍️",
  desc: "Apply font style #16 to your text",
  category: "tools",
  use: ".font16 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #16*\n\nUsage: .font16 <text>\nExample: .font16 hello`);
  const converted = convertText(text, allFonts[15]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 17
cmd({
  pattern: "font17",
  alias: ["f17"],
  react: "✍️",
  desc: "Apply font style #17 to your text",
  category: "tools",
  use: ".font17 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #17*\n\nUsage: .font17 <text>\nExample: .font17 hello`);
  const converted = convertText(text, allFonts[16]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 18
cmd({
  pattern: "font18",
  alias: ["f18"],
  react: "✍️",
  desc: "Apply font style #18 to your text",
  category: "tools",
  use: ".font18 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #18*\n\nUsage: .font18 <text>\nExample: .font18 hello`);
  const converted = convertText(text, allFonts[17]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 19
cmd({
  pattern: "font19",
  alias: ["f19"],
  react: "✍️",
  desc: "Apply font style #19 to your text",
  category: "tools",
  use: ".font19 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #19*\n\nUsage: .font19 <text>\nExample: .font19 hello`);
  const converted = convertText(text, allFonts[18]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 20
cmd({
  pattern: "font20",
  alias: ["f20"],
  react: "✍️",
  desc: "Apply font style #20 to your text",
  category: "tools",
  use: ".font20 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #20*\n\nUsage: .font20 <text>\nExample: .font20 hello`);
  const converted = convertText(text, allFonts[19]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 21
cmd({
  pattern: "font21",
  alias: ["f21"],
  react: "✍️",
  desc: "Apply font style #21 to your text",
  category: "tools",
  use: ".font21 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #21*\n\nUsage: .font21 <text>\nExample: .font21 hello`);
  const converted = convertText(text, allFonts[20]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 22
cmd({
  pattern: "font22",
  alias: ["f22"],
  react: "✍️",
  desc: "Apply font style #22 to your text",
  category: "tools",
  use: ".font22 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #22*\n\nUsage: .font22 <text>\nExample: .font22 hello`);
  const converted = convertText(text, allFonts[21]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 23
cmd({
  pattern: "font23",
  alias: ["f23"],
  react: "✍️",
  desc: "Apply font style #23 to your text",
  category: "tools",
  use: ".font23 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #23*\n\nUsage: .font23 <text>\nExample: .font23 hello`);
  const converted = convertText(text, allFonts[22]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 24
cmd({
  pattern: "font24",
  alias: ["f24"],
  react: "✍️",
  desc: "Apply font style #24 to your text",
  category: "tools",
  use: ".font24 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #24*\n\nUsage: .font24 <text>\nExample: .font24 hello`);
  const converted = convertText(text, allFonts[23]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 25
cmd({
  pattern: "font25",
  alias: ["f25"],
  react: "✍️",
  desc: "Apply font style #25 to your text",
  category: "tools",
  use: ".font25 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #25*\n\nUsage: .font25 <text>\nExample: .font25 hello`);
  const converted = convertText(text, allFonts[24]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 26
cmd({
  pattern: "font26",
  alias: ["f26"],
  react: "✍️",
  desc: "Apply font style #26 to your text",
  category: "tools",
  use: ".font26 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #26*\n\nUsage: .font26 <text>\nExample: .font26 hello`);
  const converted = convertText(text, allFonts[25]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 27
cmd({
  pattern: "font27",
  alias: ["f27"],
  react: "✍️",
  desc: "Apply font style #27 to your text",
  category: "tools",
  use: ".font27 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #27*\n\nUsage: .font27 <text>\nExample: .font27 hello`);
  const converted = convertText(text, allFonts[26]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 28
cmd({
  pattern: "font28",
  alias: ["f28"],
  react: "✍️",
  desc: "Apply font style #28 to your text",
  category: "tools",
  use: ".font28 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #28*\n\nUsage: .font28 <text>\nExample: .font28 hello`);
  const converted = convertText(text, allFonts[27]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 29
cmd({
  pattern: "font29",
  alias: ["f29"],
  react: "✍️",
  desc: "Apply font style #29 to your text",
  category: "tools",
  use: ".font29 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #29*\n\nUsage: .font29 <text>\nExample: .font29 hello`);
  const converted = convertText(text, allFonts[28]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 30
cmd({
  pattern: "font30",
  alias: ["f30"],
  react: "✍️",
  desc: "Apply font style #30 to your text",
  category: "tools",
  use: ".font30 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #30*\n\nUsage: .font30 <text>\nExample: .font30 hello`);
  const converted = convertText(text, allFonts[29]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 31
cmd({
  pattern: "font31",
  alias: ["f31"],
  react: "✍️",
  desc: "Apply font style #31 to your text",
  category: "tools",
  use: ".font31 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #31*\n\nUsage: .font31 <text>\nExample: .font31 hello`);
  const converted = convertText(text, allFonts[30]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 32
cmd({
  pattern: "font32",
  alias: ["f32"],
  react: "✍️",
  desc: "Apply font style #32 to your text",
  category: "tools",
  use: ".font32 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #32*\n\nUsage: .font32 <text>\nExample: .font32 hello`);
  const converted = convertText(text, allFonts[31]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 33
cmd({
  pattern: "font33",
  alias: ["f33"],
  react: "✍️",
  desc: "Apply font style #33 to your text",
  category: "tools",
  use: ".font33 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #33*\n\nUsage: .font33 <text>\nExample: .font33 hello`);
  const converted = convertText(text, allFonts[32]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 34
cmd({
  pattern: "font34",
  alias: ["f34"],
  react: "✍️",
  desc: "Apply font style #34 to your text",
  category: "tools",
  use: ".font34 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #34*\n\nUsage: .font34 <text>\nExample: .font34 hello`);
  const converted = convertText(text, allFonts[33]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 35
cmd({
  pattern: "font35",
  alias: ["f35"],
  react: "✍️",
  desc: "Apply font style #35 to your text",
  category: "tools",
  use: ".font35 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #35*\n\nUsage: .font35 <text>\nExample: .font35 hello`);
  const converted = convertText(text, allFonts[34]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 36
cmd({
  pattern: "font36",
  alias: ["f36"],
  react: "✍️",
  desc: "Apply font style #36 to your text",
  category: "tools",
  use: ".font36 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #36*\n\nUsage: .font36 <text>\nExample: .font36 hello`);
  const converted = convertText(text, allFonts[35]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 37
cmd({
  pattern: "font37",
  alias: ["f37"],
  react: "✍️",
  desc: "Apply font style #37 to your text",
  category: "tools",
  use: ".font37 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #37*\n\nUsage: .font37 <text>\nExample: .font37 hello`);
  const converted = convertText(text, allFonts[36]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 38
cmd({
  pattern: "font38",
  alias: ["f38"],
  react: "✍️",
  desc: "Apply font style #38 to your text",
  category: "tools",
  use: ".font38 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #38*\n\nUsage: .font38 <text>\nExample: .font38 hello`);
  const converted = convertText(text, allFonts[37]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 39
cmd({
  pattern: "font39",
  alias: ["f39"],
  react: "✍️",
  desc: "Apply font style #39 to your text",
  category: "tools",
  use: ".font39 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #39*\n\nUsage: .font39 <text>\nExample: .font39 hello`);
  const converted = convertText(text, allFonts[38]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 40
cmd({
  pattern: "font40",
  alias: ["f40"],
  react: "✍️",
  desc: "Apply font style #40 to your text",
  category: "tools",
  use: ".font40 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #40*\n\nUsage: .font40 <text>\nExample: .font40 hello`);
  const converted = convertText(text, allFonts[39]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 41
cmd({
  pattern: "font41",
  alias: ["f41"],
  react: "✍️",
  desc: "Apply font style #41 to your text",
  category: "tools",
  use: ".font41 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #41*\n\nUsage: .font41 <text>\nExample: .font41 hello`);
  const converted = convertText(text, allFonts[40]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 42
cmd({
  pattern: "font42",
  alias: ["f42"],
  react: "✍️",
  desc: "Apply font style #42 to your text",
  category: "tools",
  use: ".font42 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #42*\n\nUsage: .font42 <text>\nExample: .font42 hello`);
  const converted = convertText(text, allFonts[41]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 43
cmd({
  pattern: "font43",
  alias: ["f43"],
  react: "✍️",
  desc: "Apply font style #43 to your text",
  category: "tools",
  use: ".font43 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #43*\n\nUsage: .font43 <text>\nExample: .font43 hello`);
  const converted = convertText(text, allFonts[42]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 44
cmd({
  pattern: "font44",
  alias: ["f44"],
  react: "✍️",
  desc: "Apply font style #44 to your text",
  category: "tools",
  use: ".font44 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #44*\n\nUsage: .font44 <text>\nExample: .font44 hello`);
  const converted = convertText(text, allFonts[43]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 45
cmd({
  pattern: "font45",
  alias: ["f45"],
  react: "✍️",
  desc: "Apply font style #45 to your text",
  category: "tools",
  use: ".font45 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #45*\n\nUsage: .font45 <text>\nExample: .font45 hello`);
  const converted = convertText(text, allFonts[44]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 46
cmd({
  pattern: "font46",
  alias: ["f46"],
  react: "✍️",
  desc: "Apply font style #46 to your text",
  category: "tools",
  use: ".font46 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #46*\n\nUsage: .font46 <text>\nExample: .font46 hello`);
  const converted = convertText(text, allFonts[45]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 47
cmd({
  pattern: "font47",
  alias: ["f47"],
  react: "✍️",
  desc: "Apply font style #47 to your text",
  category: "tools",
  use: ".font47 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #47*\n\nUsage: .font47 <text>\nExample: .font47 hello`);
  const converted = convertText(text, allFonts[46]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 48
cmd({
  pattern: "font48",
  alias: ["f48"],
  react: "✍️",
  desc: "Apply font style #48 to your text",
  category: "tools",
  use: ".font48 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #48*\n\nUsage: .font48 <text>\nExample: .font48 hello`);
  const converted = convertText(text, allFonts[47]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 49
cmd({
  pattern: "font49",
  alias: ["f49"],
  react: "✍️",
  desc: "Apply font style #49 to your text",
  category: "tools",
  use: ".font49 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #49*\n\nUsage: .font49 <text>\nExample: .font49 hello`);
  const converted = convertText(text, allFonts[48]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 50
cmd({
  pattern: "font50",
  alias: ["f50"],
  react: "✍️",
  desc: "Apply font style #50 to your text",
  category: "tools",
  use: ".font50 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #50*\n\nUsage: .font50 <text>\nExample: .font50 hello`);
  const converted = convertText(text, allFonts[49]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 51
cmd({
  pattern: "font51",
  alias: ["f51"],
  react: "✍️",
  desc: "Apply font style #51 to your text",
  category: "tools",
  use: ".font51 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #51*\n\nUsage: .font51 <text>\nExample: .font51 hello`);
  const converted = convertText(text, allFonts[50]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 52
cmd({
  pattern: "font52",
  alias: ["f52"],
  react: "✍️",
  desc: "Apply font style #52 to your text",
  category: "tools",
  use: ".font52 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #52*\n\nUsage: .font52 <text>\nExample: .font52 hello`);
  const converted = convertText(text, allFonts[51]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 53
cmd({
  pattern: "font53",
  alias: ["f53"],
  react: "✍️",
  desc: "Apply font style #53 to your text",
  category: "tools",
  use: ".font53 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #53*\n\nUsage: .font53 <text>\nExample: .font53 hello`);
  const converted = convertText(text, allFonts[52]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 54
cmd({
  pattern: "font54",
  alias: ["f54"],
  react: "✍️",
  desc: "Apply font style #54 to your text",
  category: "tools",
  use: ".font54 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #54*\n\nUsage: .font54 <text>\nExample: .font54 hello`);
  const converted = convertText(text, allFonts[53]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 55
cmd({
  pattern: "font55",
  alias: ["f55"],
  react: "✍️",
  desc: "Apply font style #55 to your text",
  category: "tools",
  use: ".font55 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #55*\n\nUsage: .font55 <text>\nExample: .font55 hello`);
  const converted = convertText(text, allFonts[54]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 56
cmd({
  pattern: "font56",
  alias: ["f56"],
  react: "✍️",
  desc: "Apply font style #56 to your text",
  category: "tools",
  use: ".font56 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #56*\n\nUsage: .font56 <text>\nExample: .font56 hello`);
  const converted = convertText(text, allFonts[55]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 57
cmd({
  pattern: "font57",
  alias: ["f57"],
  react: "✍️",
  desc: "Apply font style #57 to your text",
  category: "tools",
  use: ".font57 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #57*\n\nUsage: .font57 <text>\nExample: .font57 hello`);
  const converted = convertText(text, allFonts[56]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 58
cmd({
  pattern: "font58",
  alias: ["f58"],
  react: "✍️",
  desc: "Apply font style #58 to your text",
  category: "tools",
  use: ".font58 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #58*\n\nUsage: .font58 <text>\nExample: .font58 hello`);
  const converted = convertText(text, allFonts[57]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 59
cmd({
  pattern: "font59",
  alias: ["f59"],
  react: "✍️",
  desc: "Apply font style #59 to your text",
  category: "tools",
  use: ".font59 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #59*\n\nUsage: .font59 <text>\nExample: .font59 hello`);
  const converted = convertText(text, allFonts[58]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 60
cmd({
  pattern: "font60",
  alias: ["f60"],
  react: "✍️",
  desc: "Apply font style #60 to your text",
  category: "tools",
  use: ".font60 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #60*\n\nUsage: .font60 <text>\nExample: .font60 hello`);
  const converted = convertText(text, allFonts[59]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 61
cmd({
  pattern: "font61",
  alias: ["f61"],
  react: "✍️",
  desc: "Apply font style #61 to your text",
  category: "tools",
  use: ".font61 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #61*\n\nUsage: .font61 <text>\nExample: .font61 hello`);
  const converted = convertText(text, allFonts[60]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 62
cmd({
  pattern: "font62",
  alias: ["f62"],
  react: "✍️",
  desc: "Apply font style #62 to your text",
  category: "tools",
  use: ".font62 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #62*\n\nUsage: .font62 <text>\nExample: .font62 hello`);
  const converted = convertText(text, allFonts[61]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 63
cmd({
  pattern: "font63",
  alias: ["f63"],
  react: "✍️",
  desc: "Apply font style #63 to your text",
  category: "tools",
  use: ".font63 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #63*\n\nUsage: .font63 <text>\nExample: .font63 hello`);
  const converted = convertText(text, allFonts[62]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 64
cmd({
  pattern: "font64",
  alias: ["f64"],
  react: "✍️",
  desc: "Apply font style #64 to your text",
  category: "tools",
  use: ".font64 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #64*\n\nUsage: .font64 <text>\nExample: .font64 hello`);
  const converted = convertText(text, allFonts[63]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 65
cmd({
  pattern: "font65",
  alias: ["f65"],
  react: "✍️",
  desc: "Apply font style #65 to your text",
  category: "tools",
  use: ".font65 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #65*\n\nUsage: .font65 <text>\nExample: .font65 hello`);
  const converted = convertText(text, allFonts[64]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 66
cmd({
  pattern: "font66",
  alias: ["f66"],
  react: "✍️",
  desc: "Apply font style #66 to your text",
  category: "tools",
  use: ".font66 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #66*\n\nUsage: .font66 <text>\nExample: .font66 hello`);
  const converted = convertText(text, allFonts[65]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 67
cmd({
  pattern: "font67",
  alias: ["f67"],
  react: "✍️",
  desc: "Apply font style #67 to your text",
  category: "tools",
  use: ".font67 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #67*\n\nUsage: .font67 <text>\nExample: .font67 hello`);
  const converted = convertText(text, allFonts[66]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 68
cmd({
  pattern: "font68",
  alias: ["f68"],
  react: "✍️",
  desc: "Apply font style #68 to your text",
  category: "tools",
  use: ".font68 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #68*\n\nUsage: .font68 <text>\nExample: .font68 hello`);
  const converted = convertText(text, allFonts[67]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 69
cmd({
  pattern: "font69",
  alias: ["f69"],
  react: "✍️",
  desc: "Apply font style #69 to your text",
  category: "tools",
  use: ".font69 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #69*\n\nUsage: .font69 <text>\nExample: .font69 hello`);
  const converted = convertText(text, allFonts[68]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 70
cmd({
  pattern: "font70",
  alias: ["f70"],
  react: "✍️",
  desc: "Apply font style #70 to your text",
  category: "tools",
  use: ".font70 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #70*\n\nUsage: .font70 <text>\nExample: .font70 hello`);
  const converted = convertText(text, allFonts[69]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 71
cmd({
  pattern: "font71",
  alias: ["f71"],
  react: "✍️",
  desc: "Apply font style #71 to your text",
  category: "tools",
  use: ".font71 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #71*\n\nUsage: .font71 <text>\nExample: .font71 hello`);
  const converted = convertText(text, allFonts[70]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 72
cmd({
  pattern: "font72",
  alias: ["f72"],
  react: "✍️",
  desc: "Apply font style #72 to your text",
  category: "tools",
  use: ".font72 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #72*\n\nUsage: .font72 <text>\nExample: .font72 hello`);
  const converted = convertText(text, allFonts[71]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 73
cmd({
  pattern: "font73",
  alias: ["f73"],
  react: "✍️",
  desc: "Apply font style #73 to your text",
  category: "tools",
  use: ".font73 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #73*\n\nUsage: .font73 <text>\nExample: .font73 hello`);
  const converted = convertText(text, allFonts[72]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 74
cmd({
  pattern: "font74",
  alias: ["f74"],
  react: "✍️",
  desc: "Apply font style #74 to your text",
  category: "tools",
  use: ".font74 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #74*\n\nUsage: .font74 <text>\nExample: .font74 hello`);
  const converted = convertText(text, allFonts[73]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 75
cmd({
  pattern: "font75",
  alias: ["f75"],
  react: "✍️",
  desc: "Apply font style #75 to your text",
  category: "tools",
  use: ".font75 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #75*\n\nUsage: .font75 <text>\nExample: .font75 hello`);
  const converted = convertText(text, allFonts[74]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 76
cmd({
  pattern: "font76",
  alias: ["f76"],
  react: "✍️",
  desc: "Apply font style #76 to your text",
  category: "tools",
  use: ".font76 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #76*\n\nUsage: .font76 <text>\nExample: .font76 hello`);
  const converted = convertText(text, allFonts[75]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 77
cmd({
  pattern: "font77",
  alias: ["f77"],
  react: "✍️",
  desc: "Apply font style #77 to your text",
  category: "tools",
  use: ".font77 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #77*\n\nUsage: .font77 <text>\nExample: .font77 hello`);
  const converted = convertText(text, allFonts[76]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 78
cmd({
  pattern: "font78",
  alias: ["f78"],
  react: "✍️",
  desc: "Apply font style #78 to your text",
  category: "tools",
  use: ".font78 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #78*\n\nUsage: .font78 <text>\nExample: .font78 hello`);
  const converted = convertText(text, allFonts[77]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 79
cmd({
  pattern: "font79",
  alias: ["f79"],
  react: "✍️",
  desc: "Apply font style #79 to your text",
  category: "tools",
  use: ".font79 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #79*\n\nUsage: .font79 <text>\nExample: .font79 hello`);
  const converted = convertText(text, allFonts[78]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 80
cmd({
  pattern: "font80",
  alias: ["f80"],
  react: "✍️",
  desc: "Apply font style #80 to your text",
  category: "tools",
  use: ".font80 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #80*\n\nUsage: .font80 <text>\nExample: .font80 hello`);
  const converted = convertText(text, allFonts[79]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 81
cmd({
  pattern: "font81",
  alias: ["f81"],
  react: "✍️",
  desc: "Apply font style #81 to your text",
  category: "tools",
  use: ".font81 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #81*\n\nUsage: .font81 <text>\nExample: .font81 hello`);
  const converted = convertText(text, allFonts[80]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 82
cmd({
  pattern: "font82",
  alias: ["f82"],
  react: "✍️",
  desc: "Apply font style #82 to your text",
  category: "tools",
  use: ".font82 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #82*\n\nUsage: .font82 <text>\nExample: .font82 hello`);
  const converted = convertText(text, allFonts[81]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 83
cmd({
  pattern: "font83",
  alias: ["f83"],
  react: "✍️",
  desc: "Apply font style #83 to your text",
  category: "tools",
  use: ".font83 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #83*\n\nUsage: .font83 <text>\nExample: .font83 hello`);
  const converted = convertText(text, allFonts[82]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 84
cmd({
  pattern: "font84",
  alias: ["f84"],
  react: "✍️",
  desc: "Apply font style #84 to your text",
  category: "tools",
  use: ".font84 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #84*\n\nUsage: .font84 <text>\nExample: .font84 hello`);
  const converted = convertText(text, allFonts[83]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 85
cmd({
  pattern: "font85",
  alias: ["f85"],
  react: "✍️",
  desc: "Apply font style #85 to your text",
  category: "tools",
  use: ".font85 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #85*\n\nUsage: .font85 <text>\nExample: .font85 hello`);
  const converted = convertText(text, allFonts[84]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 86
cmd({
  pattern: "font86",
  alias: ["f86"],
  react: "✍️",
  desc: "Apply font style #86 to your text",
  category: "tools",
  use: ".font86 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #86*\n\nUsage: .font86 <text>\nExample: .font86 hello`);
  const converted = convertText(text, allFonts[85]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 87
cmd({
  pattern: "font87",
  alias: ["f87"],
  react: "✍️",
  desc: "Apply font style #87 to your text",
  category: "tools",
  use: ".font87 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #87*\n\nUsage: .font87 <text>\nExample: .font87 hello`);
  const converted = convertText(text, allFonts[86]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 88
cmd({
  pattern: "font88",
  alias: ["f88"],
  react: "✍️",
  desc: "Apply font style #88 to your text",
  category: "tools",
  use: ".font88 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #88*\n\nUsage: .font88 <text>\nExample: .font88 hello`);
  const converted = convertText(text, allFonts[87]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 89
cmd({
  pattern: "font89",
  alias: ["f89"],
  react: "✍️",
  desc: "Apply font style #89 to your text",
  category: "tools",
  use: ".font89 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #89*\n\nUsage: .font89 <text>\nExample: .font89 hello`);
  const converted = convertText(text, allFonts[88]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 90
cmd({
  pattern: "font90",
  alias: ["f90"],
  react: "✍️",
  desc: "Apply font style #90 to your text",
  category: "tools",
  use: ".font90 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #90*\n\nUsage: .font90 <text>\nExample: .font90 hello`);
  const converted = convertText(text, allFonts[89]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 91
cmd({
  pattern: "font91",
  alias: ["f91"],
  react: "✍️",
  desc: "Apply font style #91 to your text",
  category: "tools",
  use: ".font91 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #91*\n\nUsage: .font91 <text>\nExample: .font91 hello`);
  const converted = convertText(text, allFonts[90]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 92
cmd({
  pattern: "font92",
  alias: ["f92"],
  react: "✍️",
  desc: "Apply font style #92 to your text",
  category: "tools",
  use: ".font92 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #92*\n\nUsage: .font92 <text>\nExample: .font92 hello`);
  const converted = convertText(text, allFonts[91]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 93
cmd({
  pattern: "font93",
  alias: ["f93"],
  react: "✍️",
  desc: "Apply font style #93 to your text",
  category: "tools",
  use: ".font93 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #93*\n\nUsage: .font93 <text>\nExample: .font93 hello`);
  const converted = convertText(text, allFonts[92]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 94
cmd({
  pattern: "font94",
  alias: ["f94"],
  react: "✍️",
  desc: "Apply font style #94 to your text",
  category: "tools",
  use: ".font94 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #94*\n\nUsage: .font94 <text>\nExample: .font94 hello`);
  const converted = convertText(text, allFonts[93]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 95
cmd({
  pattern: "font95",
  alias: ["f95"],
  react: "✍️",
  desc: "Apply font style #95 to your text",
  category: "tools",
  use: ".font95 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #95*\n\nUsage: .font95 <text>\nExample: .font95 hello`);
  const converted = convertText(text, allFonts[94]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 96
cmd({
  pattern: "font96",
  alias: ["f96"],
  react: "✍️",
  desc: "Apply font style #96 to your text",
  category: "tools",
  use: ".font96 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #96*\n\nUsage: .font96 <text>\nExample: .font96 hello`);
  const converted = convertText(text, allFonts[95]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 97
cmd({
  pattern: "font97",
  alias: ["f97"],
  react: "✍️",
  desc: "Apply font style #97 to your text",
  category: "tools",
  use: ".font97 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #97*\n\nUsage: .font97 <text>\nExample: .font97 hello`);
  const converted = convertText(text, allFonts[96]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 98
cmd({
  pattern: "font98",
  alias: ["f98"],
  react: "✍️",
  desc: "Apply font style #98 to your text",
  category: "tools",
  use: ".font98 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #98*\n\nUsage: .font98 <text>\nExample: .font98 hello`);
  const converted = convertText(text, allFonts[97]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 99
cmd({
  pattern: "font99",
  alias: ["f99"],
  react: "✍️",
  desc: "Apply font style #99 to your text",
  category: "tools",
  use: ".font99 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #99*\n\nUsage: .font99 <text>\nExample: .font99 hello`);
  const converted = convertText(text, allFonts[98]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 100
cmd({
  pattern: "font100",
  alias: ["f100"],
  react: "✍️",
  desc: "Apply font style #100 to your text",
  category: "tools",
  use: ".font100 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #100*\n\nUsage: .font100 <text>\nExample: .font100 hello`);
  const converted = convertText(text, allFonts[99]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 101
cmd({
  pattern: "font101",
  alias: ["f101"],
  react: "✍️",
  desc: "Apply font style #101 to your text",
  category: "tools",
  use: ".font101 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #101*\n\nUsage: .font101 <text>\nExample: .font101 hello`);
  const converted = convertText(text, allFonts[100]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 102
cmd({
  pattern: "font102",
  alias: ["f102"],
  react: "✍️",
  desc: "Apply font style #102 to your text",
  category: "tools",
  use: ".font102 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #102*\n\nUsage: .font102 <text>\nExample: .font102 hello`);
  const converted = convertText(text, allFonts[101]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 103
cmd({
  pattern: "font103",
  alias: ["f103"],
  react: "✍️",
  desc: "Apply font style #103 to your text",
  category: "tools",
  use: ".font103 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #103*\n\nUsage: .font103 <text>\nExample: .font103 hello`);
  const converted = convertText(text, allFonts[102]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 104
cmd({
  pattern: "font104",
  alias: ["f104"],
  react: "✍️",
  desc: "Apply font style #104 to your text",
  category: "tools",
  use: ".font104 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #104*\n\nUsage: .font104 <text>\nExample: .font104 hello`);
  const converted = convertText(text, allFonts[103]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});

// Font 105
cmd({
  pattern: "font105",
  alias: ["f105"],
  react: "✍️",
  desc: "Apply font style #105 to your text",
  category: "tools",
  use: ".font105 <text>",
  filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
  if (!text) return reply(`*Font #105*\n\nUsage: .font105 <text>\nExample: .font105 hello`);
  const converted = convertText(text, allFonts[104]);
  await conn.sendMessage(from, { text: converted }, { quoted: mek });
});
