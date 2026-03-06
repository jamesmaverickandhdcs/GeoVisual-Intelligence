"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Area } from "recharts";

interface Quote { symbol:string; name:string; price:number; change:number; changePercent:number; type:"stock"|"oil"|"gold"; }
interface HistPoint { date:string; close:number; volume:number|null; }

const TYPE_ICONS: Record<string,string> = { stock:"📈", oil:"🛢️", gold:"🥇" };
const SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","TSLA","CL=F","GC=F"];

// Simulated news impact events on stock chart
const NEWS_IMPACTS = [
  { date:"Wed", event:"OPEC cut", impact:-2.1, sentiment:"negative" },
  { date:"Fri", event:"EU deal",  impact:+1.8, sentiment:"positive" },
];

export default function FinancialDashboard() {
  const [quotes,    setQuotes]    = useState<Quote[]>([]);
  const [history,   setHistory]   = useState<HistPoint[]>([]);
  const [selected,  setSelected]  = useState<Quote|null>(null);
  const [range,     setRange]     = useState("7d");
  const [loading,   setLoading]   = useState(true);
  const [histLoad,  setHistLoad]  = useState(false);
  const [lastUpdate,setLastUpdate]= useState("");
  const [error,     setError]     = useState("");

  const fetchQuotes = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/stocks");
      const data = await res.json();
      if (data.quotes?.length > 0) {
        setQuotes(data.quotes);
        setLastUpdate(new Date().toLocaleTimeString());
        if (!selected) setSelected(data.quotes[0]);
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [selected]);

  const fetchHistory = useCallback(async (symbol: string, r: string) => {
    setHistLoad(true);
    try {
      const res  = await fetch(`/api/stocks/history?symbol=${symbol}&range=${r}`);
      const data = await res.json();
      setHistory(data.history ?? []);
    } catch { setHistory([]); }
    finally { setHistLoad(false); }
  }, []);

  useEffect(() => { fetchQuotes(); }, []); // eslint-disable-line
  useEffect(() => {
    if (selected) fetchHistory(selected.symbol, range);
  }, [selected, range, fetchHistory]);

  // Merge news impact onto chart data
  const chartData = history.map(h => {
    const impact = NEWS_IMPACTS.find(n => n.date === h.date);
    return { ...h, event: impact?.event, impact: impact?.impact, sentiment: impact?.sentiment };
  });

  const stocks      = quotes.filter(q => q.type === "stock");
  const commodities = quotes.filter(q => q.type !== "stock");

  return (
    <div style={{ minHeight:"100vh", background:"#0F1F33", color:"#fff", fontFamily:"sans-serif", padding:24, overflowY:"auto" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ color:"#C9A227", fontSize:22, fontWeight:700, margin:0 }}>💹 Financial Impact</h1>
          <p style={{ color:"#666", fontSize:11, margin:"3px 0 0" }}>{lastUpdate ? `Updated: ${lastUpdate}` : "Loading..."}</p>
        </div>
        <button onClick={fetchQuotes} style={{ background:"rgba(201,162,39,0.15)", border:"1px solid rgba(201,162,39,0.4)", borderRadius:10, padding:"8px 16px", color:"#C9A227", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          🔄 Refresh
        </button>
      </div>

      {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 16px", marginBottom:14, color:"#EF4444", fontSize:12 }}>⚠️ Using cached data</div>}

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
          <p style={{ color:"#C9A227" }}>Loading market data...</p>
        </div>
      ) : (
        <>
          {/* Commodities */}
          <Section title="Commodities">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:12 }}>
              {commodities.map(q => <QuoteCard key={q.symbol} quote={q} active={selected?.symbol===q.symbol} onClick={()=>setSelected(q)} />)}
            </div>
          </Section>

          {/* Stocks */}
          <Section title="US Stocks">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:10 }}>
              {stocks.map(q => <QuoteCard key={q.symbol} quote={q} active={selected?.symbol===q.symbol} onClick={()=>setSelected(q)} />)}
            </div>
          </Section>

          {/* Chart */}
          {selected && (
            <Section title={`${selected.name} — Price History`}>
              {/* Range selector */}
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {["1d","5d","7d","1mo","3mo"].map(r => (
                  <button key={r} onClick={()=>setRange(r)} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", background: range===r?"rgba(201,162,39,0.2)":"rgba(30,58,95,0.4)", borderColor: range===r?"rgba(201,162,39,0.5)":"rgba(201,162,39,0.15)", color: range===r?"#C9A227":"#888" }}>
                    {r}
                  </button>
                ))}
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <p style={{ color:"#fff", fontSize:20, fontWeight:700, margin:0 }}>${selected.price.toFixed(2)}</p>
                  <p style={{ color: selected.change>=0?"#4CAF50":"#EF4444", fontSize:12, margin:0, fontWeight:600 }}>
                    {selected.change>=0?"▲":"▼"} {Math.abs(selected.change).toFixed(2)} ({Math.abs(selected.changePercent).toFixed(2)}%)
                  </p>
                </div>
              </div>

              {histLoad ? (
                <div style={{ height:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ color:"#C9A227" }}>Loading chart...</p>
                </div>
              ) : (
                <>
                  {/* Price + Area chart */}
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={selected.change>=0?"#4CAF50":"#EF4444"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selected.change>=0?"#4CAF50":"#EF4444"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.08)" />
                      <XAxis dataKey="date" stroke="#555" tick={{ fill:"#777", fontSize:11 }} />
                      <YAxis stroke="#555" tick={{ fill:"#777", fontSize:11 }} domain={["auto","auto"]} />
                      <Tooltip
                        contentStyle={{ background:"#0F1F33", border:"1px solid rgba(201,162,39,0.3)", borderRadius:8, color:"#fff" }}
                        formatter={(v:number, name:string) => name==="close" ? [`$${v}`, selected.symbol] : [v, name]}
                        labelFormatter={(label, payload) => {
                          const d = payload?.[0]?.payload;
                          return d?.event ? `${label} 📌 ${d.event}` : label;
                        }}
                      />
                      <Area type="monotone" dataKey="close" stroke={selected.change>=0?"#4CAF50":"#EF4444"} strokeWidth={2} fill="url(#priceGrad)" dot={{ fill:"#C9A227", r:3 }} activeDot={{ r:6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>

                  {/* Volume chart */}
                  {chartData.some(d => d.volume) && (
                    <div style={{ marginTop:12 }}>
                      <p style={{ color:"#555", fontSize:11, margin:"0 0 6px" }}>Volume (millions)</p>
                      <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={chartData}>
                          <XAxis dataKey="date" stroke="#555" tick={{ fill:"#666", fontSize:10 }} />
                          <Tooltip contentStyle={{ background:"#0F1F33", border:"1px solid rgba(201,162,39,0.3)", borderRadius:8, color:"#fff" }} formatter={(v:number)=>[`${v}M`, "Volume"]} />
                          <Bar dataKey="volume" fill="rgba(201,162,39,0.4)" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* News impact indicators */}
                  <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
                    <p style={{ color:"#555", fontSize:11, width:"100%", margin:"0 0 6px" }}>📌 News Impact Events</p>
                    {NEWS_IMPACTS.map(n => (
                      <div key={n.event} style={{ background: n.sentiment==="positive"?"rgba(76,175,80,0.1)":"rgba(239,68,68,0.1)", border:`1px solid ${n.sentiment==="positive"?"rgba(76,175,80,0.3)":"rgba(239,68,68,0.3)"}`, borderRadius:8, padding:"6px 12px", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ color: n.sentiment==="positive"?"#4CAF50":"#EF4444", fontSize:12, fontWeight:700 }}>
                          {n.sentiment==="positive"?"▲":""}{n.impact>0?"+":""}{n.impact}%
                        </span>
                        <span style={{ color:"#aaa", fontSize:11 }}>{n.event}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h2 style={{ color:"#C9A227", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:"0 0 12px" }}>{title}</h2>
      <div style={{ background:"rgba(30,58,95,0.3)", border:"1px solid rgba(201,162,39,0.15)", borderRadius:14, padding:16 }}>
        {children}
      </div>
    </div>
  );
}

function QuoteCard({ quote, active, onClick }: { quote:Quote; active:boolean; onClick:()=>void }) {
  const up = quote.change >= 0;
  return (
    <div onClick={onClick} style={{ background: active?"rgba(201,162,39,0.12)":"rgba(15,31,51,0.5)", border:`1px solid ${active?"rgba(201,162,39,0.5)":"rgba(201,162,39,0.12)"}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ color:"#C9A227", fontSize:11, fontWeight:700 }}>{quote.symbol}</span>
        <span style={{ fontSize:14 }}>{TYPE_ICONS[quote.type]}</span>
      </div>
      <p style={{ color:"#aaa", fontSize:11, margin:"0 0 6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{quote.name}</p>
      <p style={{ color:"#fff", fontSize:18, fontWeight:700, margin:"0 0 3px" }}>${quote.price.toFixed(2)}</p>
      <p style={{ color: up?"#4CAF50":"#EF4444", fontSize:11, fontWeight:600, margin:0 }}>
        {up?"▲":"▼"} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
      </p>
    </div>
  );
}
