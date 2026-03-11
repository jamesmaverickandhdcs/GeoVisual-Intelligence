import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://geovisual-intelligence.vercel.app";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Get latest 5 articles
    const { data: articles } = await supabase
      .from("news_articles").select("*").order("created_at", { ascending:false }).limit(5);
    if (!articles?.length) return NextResponse.json({ message:"No articles" });

    // Get all users
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (!users?.length) return NextResponse.json({ message:"No users" });

    const SENT_COLOR: Record<string,string> = { positive:"#4CAF50", neutral:"#C9A227", negative:"#EF4444" };
    const articleHtml = articles.map(a => `
      <div style="border-left:3px solid ${SENT_COLOR[a.sentiment]??'#C9A227'};padding:12px 16px;margin-bottom:16px;background:#1a2d47;border-radius:0 8px 8px 0;">
        <p style="color:${SENT_COLOR[a.sentiment]??'#C9A227'};font-size:11px;margin:0 0 4px;text-transform:uppercase;">${a.country_name} · ${a.sentiment}</p>
        <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 8px;">${a.title}</p>
        <p style="color:#aaa;font-size:13px;margin:0 0 10px;">${a.summary_short}</p>
        <a href="${a.source_url}" style="color:#C9A227;font-size:12px;">Read more → ${a.source}</a>
      </div>`).join("");

    const html = `<!DOCTYPE html><html><body style="background:#0F1F33;font-family:Arial,sans-serif;padding:20px;">
      <div style="max-width:600px;margin:0 auto;">
        <div style="text-align:center;padding:24px 0;border-bottom:1px solid rgba(201,162,39,0.3);margin-bottom:24px;">
          <h1 style="color:#C9A227;font-size:24px;margin:0 0 4px;">🌍 GeoVisual Intelligence</h1>
          <p style="color:#666;font-size:13px;margin:0;">Daily Briefing · ${new Date().toDateString()}</p>
        </div>
        ${articleHtml}
        <div style="text-align:center;padding:20px 0;border-top:1px solid rgba(201,162,39,0.2);margin-top:24px;">
          <a href="${APP_URL}/map" style="background:#C9A227;color:#0F1F33;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;">🌍 Open Live Map</a>
          <p style="color:#555;font-size:11px;margin:16px 0 0;">GeoVisual Intelligence v7.0 · HDCS Geeks</p>
        </div>
      </div></body></html>`;

    const results = await Promise.allSettled(
      users.filter(u => u.email).map(user =>
        fetch("https://api.resend.com/emails", {
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${RESEND_API_KEY}`},
          body: JSON.stringify({
            from:    "GeoVisual Intelligence <onboarding@resend.dev>",
            to:      [user.email!],
            subject: `🌍 GeoVisual Daily Brief · ${new Date().toDateString()}`,
            html,
          }),
        })
      )
    );

    const sent   = results.filter(r => r.status==="fulfilled").length;
    const failed = results.filter(r => r.status==="rejected").length;
    return NextResponse.json({ sent, failed, total:users.length });
  } catch (err) {
    return NextResponse.json({ error:String(err) }, { status:500 });
  }
}
