const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface SummarizeResult {
  short: string; // 3 ကြောင်း
  long: string;  // 15 ကြောင်း
  sentiment: "positive" | "neutral" | "negative";
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<SummarizeResult> {
  const prompt = `
You are a geopolitical news analyst. Summarize the following news article.

Title: ${title}
Content: ${content}

Respond ONLY in this JSON format (no markdown, no extra text):
{
  "short": "3-sentence summary here",
  "long": "15-sentence detailed summary here",
  "sentiment": "positive" | "neutral" | "negative"
}
`;

  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { short: text.slice(0, 300), long: text, sentiment: "neutral" };
  }
}
