import { NextResponse } from "next/server";

const NEWS_API_KEY   = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID     = process.env.TELEGRAM_CHANNEL_ID;

const COUNTRY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  us: { lat: 38.9,  lng: -77.0,  name: "United States" },
  gb: { lat: 51.5,  lng: -0.1,   name: "United Kingdom" },
  de: { lat: 52.5,  lng: 13.4,   name: "Germany" },
  fr: { lat: 48.8,  lng: 2.3,    name: "France" },
  cn: { lat: 39.9,  lng: 116.4,  name: "China" },
  jp: { lat: 35.7,  lng: 139.7,  name: "Japan" },
  ru: { lat: 55.7,  lng: 37.6,   name: "Russia" },
  in: { lat: 28.6,  lng: 77.2,   name: "India" },
  br: { lat: -15.8, lng: -47.9,  name: "Brazil" },
  au: { lat: -35.3, lng: 149.1,  name: "Australia" },
  za: { lat: -25.7, lng: 28.2,   name: "South Africa" },
  eg: { lat: 30.0,  lng: 31.2,   name: "Egypt" },
  sa: { lat: 24.7,  lng: 46.7,   name: "Saudi Arabia" },
  il: { lat: 31.8,  lng: 35.2,   name: "Israel" },
  ua: { lat: 50.4,  lng: 30.5,   name: "Ukraine" },
  kr: { lat: 37.6,  lng: 127.0,  name: "South Korea" },
  tr: { lat: 39.9,  lng: 32.9,   name: "Turkey" },
  pk: { lat: 33.7,  lng: 73.1,   name: "Pakistan" },
  ng: { lat: 9.1,   lng: 7.4,    name: "Nigeria" },
  mx: { lat: 19.4,  lng: -99.1,  name: "Mexico" },
  ir: { lat: 35.7,  lng: 51.4,   name: "Iran" },
  iq: { lat: 33.3,  lng: 44.4,   name: "Iraq" },
  sy: { lat: 33.5,  lng: 36.3,   name: "Syria" },
  kp: { lat: 39.0,  lng: 125.8,  name: "North Korea" },
  ve: { lat: 10.5,  lng: -66.9,  name: "Venezuela" },
  af: { lat: 34.5,  lng: 69.2,   name: "Afghanistan" },
  ps: { lat: 31.9,  lng: 35.2,   name: "Palestine" },
  ly: { lat: 32.9,  lng: 13.2,   name: "Libya" },
  sd: { lat: 15.5,  lng: 32.5,   name: "Sudan" },
  et: { lat: 9.0,   lng: 38.7,   name: "Ethiopia" },
};

const SENT_EMOJI: Record<string,string> = { positive:"✅", neutral:"📰", negative:"🚨" };
const CAT_EMOJI:  Record<string,string> = { economy:"📈", conflict:"⚔️", politics:"🏛️", diplomacy:"🤝", other:"🌐" };

async function sendTelegram(article: {
  title: string; summary_short: string; country_name: string;
  sentiment: string; category: string; source: string; source_url: string;
}) {
  if (!BOT_TOKEN || !CHANNEL_ID) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://geovisual-intelligence.vercel.app";
  const msg = `${SENT_EMOJI[article.sentiment] ?? "📰"} *Breaking News*\n\n${CAT_EMOJI[article.category] ?? "🌐"} *${article.country_name}* | _${article.category.toUpperCase()}_\n\n*${article.title}*\n\n${article.summary_short}\n\n📡 Source: [${article.source}](${article.source_url})\n🔗 [GeoVisual Intelligence](${appUrl}/map)`;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHANNEL_ID, text: msg, parse_mode: "Markdown", disable_web_page_preview: false }),
    });
  } catch (e) { console.error("Telegram error:", e); }
}

async function geminiAnalyze(title: string, content: string) {
  const prompt = `You are a geopolitical analyst. Analyze this news article.

Title: ${title}
Content: ${content.slice(0, 1500)}

Respond ONLY in valid JSON (no markdown, no extra text):
{
  "short": "3 sentence summary",
  "long": "10 sentence detailed analysis",
  "sentiment": "positive" or "neutral" or "negative",
  "category": "politics" or "economy" or "conflict" or "diplomacy" or "other",
  "country_code": "2-letter ISO country code of the country most affected. NEVER return us unless ONLY US internal politics. Iran=ir, Israel=il, Ukraine=ua, Russia=ru, China=cn, Palestine=ps"
}`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.2, maxOutputTokens:1024} }) }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  } catch {
    return { short:title, long:title, sentiment:"neutral", category:"other", country_code:"us" };
  }
}

export async function GET() {
  try {
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=reuters,bbc-news,al-jazeera-english,cnn,france-24,the-hindu&pageSize=12&apiKey=${NEWS_API_KEY}`
    );
    const newsData = await newsRes.json();
    if (newsData.status !== "ok") throw new Error(newsData.message || "NewsAPI error");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const articles = (newsData.articles ?? []).filter((a: any) =>
      a.title && a.description && a.title !== "[Removed]"
    );
    if (articles.length === 0) throw new Error("No articles");

    const processed = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      articles.slice(0, 6).map(async (article: any) => {
        const ai = await geminiAnalyze(article.title, article.description + " " + (article.content ?? ""));
        const countryCode = (ai.country_code ?? "us").toLowerCase();
        const coords = COUNTRY_COORDS[countryCode] ?? COUNTRY_COORDS["us"];
        const latOffset = (Math.random() - 0.5) * 4;
        const lngOffset = (Math.random() - 0.5) * 4;

        const result = {
          id:            Buffer.from(article.url).toString("base64").slice(0, 16),
          title:         article.title,
          summary_short: ai.short  ?? article.description,
          summary_long:  ai.long   ?? article.description,
          source:        article.source?.name ?? "Unknown",
          source_url:    article.url,
          country_code:  countryCode.toUpperCase(),
          country_name:  coords.name,
          latitude:      coords.lat + latOffset,
          longitude:     coords.lng + lngOffset,
          published_at:  article.publishedAt,
          category:      ai.category  ?? "other",
          sentiment:     ai.sentiment ?? "neutral",
          created_at:    new Date().toISOString(),
        };

        // Send to Telegram (only negative/conflict for alerts)
        if (result.sentiment === "negative" || result.category === "conflict") {
          await sendTelegram(result);
        }

        return result;
      })
    );

    return NextResponse.json({ articles: processed, total: processed.length });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
