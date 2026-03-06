const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export async function sendTelegramAlert(article: {
  title: string;
  summary_short: string;
  country_name: string;
  sentiment: string;
  source: string;
  source_url: string;
  category: string;
}) {
  if (!BOT_TOKEN || !CHANNEL_ID) return { ok: false, error: "Telegram not configured" };

  const EMOJI: Record<string, string> = {
    positive: "✅", neutral: "📰", negative: "🚨",
    economy: "📈", conflict: "⚔️", politics: "🏛️", diplomacy: "🤝", other: "🌐",
  };

  const sentimentEmoji = EMOJI[article.sentiment] ?? "📰";
  const categoryEmoji  = EMOJI[article.category]  ?? "🌐";

  const message = `${sentimentEmoji} *Breaking News*

${categoryEmoji} *${article.country_name}* | _${article.category.toUpperCase()}_

*${article.title}*

${article.summary_short}

📡 Source: [${article.source}](${article.source_url})
🔗 [Read on GeoVisual Intelligence](${process.env.NEXT_PUBLIC_APP_URL}/map)`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Telegram error:", err);
    return { ok: false, error: String(err) };
  }
}
