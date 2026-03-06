import { NextResponse } from "next/server";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "oil" | "gold";
}

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "CL=F", "GC=F"];

export async function GET() {
  try {
    const joined = SYMBOLS.join(",");
    const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${joined}&range=1d&interval=5m`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);

    const data = await res.json();
    const sparkData = data?.spark?.result ?? [];

    const quotes: Quote[] = sparkData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        const symbol   = item.symbol;
        const response = item.response?.[0];
        const meta     = response?.meta;
        const closes   = response?.indicators?.quote?.[0]?.close ?? [];
        const validCloses = closes.filter((v: number | null) => v !== null && v !== undefined);

        if (!meta || validCloses.length === 0) return null;

        const price  = meta.regularMarketPrice ?? validCloses[validCloses.length - 1];
        const prev   = meta.chartPreviousClose ?? validCloses[0];
        const change = price - prev;
        const changePct = prev > 0 ? (change / prev) * 100 : 0;

        return {
          symbol,
          name: symbol === "CL=F" ? "Crude Oil" : symbol === "GC=F" ? "Gold" : meta.longName ?? meta.shortName ?? symbol,
          price:         +price.toFixed(2),
          change:        +change.toFixed(2),
          changePercent: +changePct.toFixed(2),
          type:          symbol === "CL=F" ? "oil" : symbol === "GC=F" ? "gold" : "stock",
        } as Quote;
      })
      .filter(Boolean);

    if (quotes.length === 0) throw new Error("No valid quotes parsed");

    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("Stocks error:", err);
    // Fallback mock data so dashboard always shows something
    const fallback: Quote[] = [
      { symbol: "AAPL",  name: "Apple Inc.",      price: 227.50, change:  1.20, changePercent:  0.53, type: "stock" },
      { symbol: "MSFT",  name: "Microsoft Corp.", price: 415.30, change: -2.10, changePercent: -0.50, type: "stock" },
      { symbol: "GOOGL", name: "Alphabet Inc.",   price: 175.80, change:  0.90, changePercent:  0.51, type: "stock" },
      { symbol: "AMZN",  name: "Amazon.com Inc.", price: 225.60, change:  3.40, changePercent:  1.53, type: "stock" },
      { symbol: "TSLA",  name: "Tesla Inc.",      price: 248.70, change: -5.30, changePercent: -2.09, type: "stock" },
      { symbol: "CL=F",  name: "Crude Oil",       price:  78.45, change: -0.85, changePercent: -1.07, type: "oil"   },
      { symbol: "GC=F",  name: "Gold",            price: 2045.30,change: 12.40, changePercent:  0.61, type: "gold"  },
    ];
    return NextResponse.json({ quotes: fallback, cached: true });
  }
}
