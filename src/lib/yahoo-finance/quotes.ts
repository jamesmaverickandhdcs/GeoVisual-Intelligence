import axios from "axios";

export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "oil" | "gold";
}

const DEFAULT_SYMBOLS = {
  stocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
  commodities: ["CL=F", "GC=F"], // Oil & Gold futures
};

export async function getQuotes(symbols: string[]): Promise<QuoteData[]> {
  try {
    const joined = symbols.join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    return (data?.quoteResponse?.result ?? []).map((q: Record<string, unknown>) => ({
      symbol: q.symbol as string,
      name: (q.shortName ?? q.longName ?? q.symbol) as string,
      price: (q.regularMarketPrice ?? 0) as number,
      change: (q.regularMarketChange ?? 0) as number,
      changePercent: (q.regularMarketChangePercent ?? 0) as number,
      type: (q.symbol === "CL=F" ? "oil" : q.symbol === "GC=F" ? "gold" : "stock") as QuoteData["type"],
    }));
  } catch (err) {
    console.error("Yahoo Finance error:", err);
    return [];
  }
}

export async function getDefaultMarketData(): Promise<QuoteData[]> {
  const all = [...DEFAULT_SYMBOLS.stocks, ...DEFAULT_SYMBOLS.commodities];
  return getQuotes(all);
}
