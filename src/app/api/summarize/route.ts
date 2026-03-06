import { NextRequest, NextResponse } from "next/server";
import { summarizeArticle } from "@/lib/gemini/summarize";

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 });
    }
    const result = await summarizeArticle(title, content);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Summarize error:", err);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
