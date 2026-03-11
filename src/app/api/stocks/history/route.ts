import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "AAPL";
  const range  = req.nextUrl.searchParams.get("range")  ?? "7d";

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const data = await res.json();
    const result     = data?.chart?.result?.[0];
    const meta       = result?.meta;
    const timestamps = result?.timestamp ?? [];
    const closes     = result?.indicators?.quote?.[0]?.close  ?? [];
    const volumes    = result?.indicators?.quote?.[0]?.volume ?? [];
    const history = timestamps
      .map((ts: number, i: number) => ({
        date:   new Date(ts * 1000).toLocaleDateString("en-US", { month:"short", day:"numeric" }),
        close:  closes[i]  ? +closes[i].toFixed(2) : null,
        volume: volumes[i] ? Math.round(volumes[i] / 1_000_000) : null,
      }))
      .filter((d: {close:number|null}) => d.close !== null);
    return NextResponse.json({
      symbol,
      name: meta?.longName ?? meta?.shortName ?? symbol,
      currency: meta?.currency ?? "USD",
      currentPrice: meta?.regularMarketPrice ?? closes.at(-1),
      history,
    });
  } catch {
    // Fallback mock data for all symbols
    const bases: Record<string,number> = {
      "AAPL":227, "MSFT":415, "TSLA":248, "NVDA":875, "AMZN":225,
      "GC=F":2045, "CL=F":78, "BTC-USD":67500, "DX-Y.NYB":104, "SI=F":28,
    };
    const base = bases[symbol] ?? 100;
    const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const history = labels.map(date => ({
      date,
      close:  +(base * (0.96 + Math.random() * 0.08)).toFixed(symbol === "BTC-USD" ? 0 : 2),
      volume: Math.round(20 + Math.random() * 40),
    }));
    return NextResponse.json({ symbol, name:symbol, currency:"USD", currentPrice:base, history, cached:true });
  }
}
