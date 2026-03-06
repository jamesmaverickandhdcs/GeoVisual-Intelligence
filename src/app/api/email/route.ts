import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { to, articles } = await req.json();
    if (!to || !articles?.length) {
      return NextResponse.json({ error: "to and articles required" }, { status: 400 });
    }

    const articleHtml = articles.slice(0, 5).map((a: {
      title: string; summary_short: string; country_name: string;
      sentiment: string; source: string; source_url: string;
    }) => `
      <div style="border-left: 3px solid #C9A227; padding: 12px 16px; margin-bottom: 16px; background: #1a2d47; border-radius: 0 8px 8px 0;">
        <p style="color: #C9A227; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">
          📍 ${a.country_name} · ${a.sentiment.toUpperCase()}
        </p>
        <p style="color: #ffffff; font-size: 15px; font-weight: 700; margin: 0 0 8px; line-height: 1.4;">
          ${a.title}
        </p>
        <p style="color: #aaaaaa; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">
          ${a.summary_short}
        </p>
        <a href="${a.source_url}" style="color: #C9A227; font-size: 12px; text-decoration: none;">
          Read more → ${a.source}
        </a>
      </div>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="background: #0F1F33; font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid rgba(201,162,39,0.3); margin-bottom: 24px;">
            <h1 style="color: #C9A227; font-size: 24px; margin: 0 0 4px;">🌍 GeoVisual Intelligence</h1>
            <p style="color: #666; font-size: 13px; margin: 0;">Daily Geopolitical Briefing · ${new Date().toDateString()}</p>
          </div>
          <!-- Articles -->
          ${articleHtml}
          <!-- Footer -->
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(201,162,39,0.2); margin-top: 24px;">
            <p style="color: #555; font-size: 11px; margin: 0;">
              GeoVisual Intelligence v7.0 · HDCS Geeks<br/>
              AI-Powered by Gemini 1.5 Flash
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    "GeoVisual Intelligence <onboarding@resend.dev>",
        to:      [to],
        subject: `🌍 GeoVisual Daily Brief · ${new Date().toDateString()}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Resend error");

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
