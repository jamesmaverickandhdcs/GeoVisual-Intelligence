import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ articles: data });
  } catch (err) {
    console.error("News fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
