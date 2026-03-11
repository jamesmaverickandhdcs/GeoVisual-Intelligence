import { NextResponse } from "next/server";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "oil" | "gold" | "crypto" | "index" | "commodity";
}

const SYMBOLS = [
  "AAPL", "MSFT", "TSLA", "NVDA", "AMZN",  // Stocks
  "GC=F",                                     // Gold
  "CL=F",                                     // Crude Oil
  "BTC-USD",                                  // Bitcoin
  "DX-Y.NYB",                                 // USD Index
  "SI=F",                                     // Silver
];

const META: Record<string, { name: string; type: Quote["type"] }> = {
  "AAPL":      { name: "Apple Inc.",          type: "stock" },
  "MSFT":      { name: "Microsoft Corp.",     type: "stock" },
  "TSLA":      { name: "Tesla Inc.",          type: "stock" },
  "NVDA":      { name: "NVIDIA Corp.",        type: "stock" },
  "AMZN":      { name: "Amazon.com Inc.",     type: "stock" },
  "GC=F":      { name: "Gold",                type: "gold" },
  "CL=F":      { name: "Crude Oil (WTI)",     type: "oil" },
  "BTC-USD":   { name: "Bitcoin",             type: "crypto" },
  "DX-Y.NYB":  { name: "US Dollar Index",     type: "index" },
  "SI=F":      { name: "Silver",              type: "commodity" },
};

const FALLBACK: Quote[] = [
  { symbol:"AAPL",     name:"Apple Inc.",       price: 227.50,   change:  1.20,  changePercent:  0.53, type:"stock" },
  { symbol:"MSFT",     name:"Microsoft Corp.",  price: 415.30,   change: -2.10,  changePercent: -0.50, type:"stock" },
  { symbol:"TSLA",     name:"Tesla Inc.",       price: 248.70,   change: -5.30,  changePercent: -2.09, type:"stock" },
  { symbol:"NVDA",     name:"NVIDIA Corp.",     price: 875.40,   change: 12.50,  changePercent:  1.45, type:"stock" },
  { symbol:"AMZN",     name:"Amazon.com Inc.",  price: 225.60,   change:  3.40,  changePercent:  1.53, type:"stock" },
  { symbol:"GC=F",     name:"Gold",             price:2045.30,   change: 12.40,  changePercent:  0.61, type:"gold" },
  { symbol:"CL=F",     name:"Crude Oil (WTI)",  price:  78.45,   change: -0.85,  changePercent: -1.07, type:"oil" },
  { symbol:"BTC-USD",  name:"Bitcoin",          price:67500.00,  change:1250.00, changePercent:  1.89, type:"crypto" },
  { symbol:"DX-Y.NYB", name:"US Dollar Index",  price: 104.20,   change:  0.35,  changePercent:  0.34, type:"index" },
  { symbol:"SI=F",     name:"Silver",           price:  27.85,   change:  0.42,  changePercent:  1.53, type:"commodity" },
];

export async function GET() {
  try {
    const joined = SYMBOLS.join(",");
    const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${joined}&range=1d&interval=5m`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);

    const data = await res.json();
    const sparkData = data?.spark?.result ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes: Quote[] = sparkData.map((item: any) => {
      const symbol   = item.symbol;
      const response = item.response?.[0];
      const meta     = response?.meta;
      const closes   = response?.indicators?.quote?.[0]?.close ?? [];
      const valid    = closes.filter((v: number | null) => v != null);
      if (!meta || valid.length === 0) return null;

      const price    = meta.regularMarketPrice ?? valid.at(-1);
      const prev     = meta.chartPreviousClose ?? valid[0];
      const change   = price - prev;
      const changePct= prev > 0 ? (change / prev) * 100 : 0;
      const info     = META[symbol] ?? { name: symbol, type: "stock" };

      return {
        symbol,
        name:          info.name,
        price:         +price.toFixed(symbol === "BTC-USD" ? 0 : 2),
        change:        +change.toFixed(symbol === "BTC-USD" ? 0 : 2),
        changePercent: +changePct.toFixed(2),
        type:          info.type,
      } as Quote;
    }).filter(Boolean);

    if (quotes.length === 0) throw new Error("No quotes");

    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("Stocks error:", err);
    return NextResponse.json({ quotes: FALLBACK, cached: true });
  }
}
