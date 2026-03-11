"use client";

import { useEffect, useState, useCallback } from "react";
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Quote { symbol:string; name:string; price:number; change:number; changePercent:number; type:string; }
interface HistPoint { date:string; close:number; volume:number|null; }

const TYPE_ICONS: Record<string,string>  = { stock:"📈", oil:"🛢️", gold:"🥇", crypto:"₿", index:"💵", commodity:"🪙" };
const TYPE_LABELS: Record<string,string> = { stock:"US Stocks", oil:"Energy", gold:"Precious Metals", crypto:"Crypto", index:"Forex/Index", commodity:"Precious Metals" };

export default function FinancialDashboard() {
  const [quotes,    setQuotes]    = useState<Quote[]>([]);
  const [history,   setHistory]   = useState<HistPoint[]>([]);
  const [selected,  setSelected]  = useState<Quote|null>(null);
  const [range,     setRange]     = useState("7d");
  const [loading,   setLoading]   = useState(true);
  const [histLoad,  setHistLoad]  = useState(false);
  const [lastUpdate,setLastUpdate]= useState("");

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/stocks");
      const data = await res.json();
      if (data.quotes?.length > 0) {
        setQuotes(data.quotes);
        setLastUpdate(new Date().toLocaleTimeString());
        setSelected(prev => prev ?? data.quotes[0]);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

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
  useEffect(() => { if (selected) fetchHistory(selected.symbol, range); }, [selected, range, fetchHistory]);

  // All quotes in one flat list (no grouping) for horizontal scroll
  const groups: Record<string, Quote[]> = {};
  quotes.forEach(q => {
    const label = TYPE_LABELS[q.type] ?? q.type;
    if (!groups[label]) groups[label] = [];
    groups[label].push(q);
  });

  return (
    <div style={{ height:"100%", background:"#0F1F33", color:"#fff", fontFamily:"sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px 0", flexShrink:0 }}>
        <div>
          <h1 style={{ color:"#C9A227", fontSize:20, fontWeight:700, margin:0 }}>💹 Financial Impact</h1>
          <p style={{ color:"#666", fontSize:11, margin:"2px 0 0" }}>{lastUpdate ? `Updated: ${lastUpdate}` : "Loading..."}</p>
        </div>
        <button onClick={fetchQuotes} style={{ background:"rgba(201,162,39,0.15)", border:"1px solid rgba(201,162,39,0.4)", borderRadius:10, padding:"7px 14px", color:"#C9A227", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flex:1 }}>
          <p style={{ color:"#C9A227" }}>Loading market data...</p>
        </div>
      ) : (
        <div style={{ display:"flex", flex:1, gap:16, padding:16, overflow:"hidden" }}>

          {/* LEFT — Cards (scrollable) */}
          <div style={{ width:260, flexShrink:0, overflowY:"auto", display:"flex", flexDirection:"column", gap:12 }}>
            {Object.entries(groups).map(([label, items]) => (
              <div key={label}>
                <p style={{ color:"#C9A227", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:"0 0 6px" }}>{label}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {items.map(q => <QuoteCard key={q.symbol} quote={q} active={selected?.symbol===q.symbol} onClick={()=>setSelected(q)} />)}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Chart */}
          <div style={{ flex:1, background:"rgba(30,58,95,0.3)", border:"1px solid rgba(201,162,39,0.15)", borderRadius:14, padding:18, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {selected && (
              <>
                {/* Chart header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <h2 style={{ color:"#C9A227", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:"0 0 8px" }}>
                      {TYPE_ICONS[selected.type]} {selected.name} — Price History
                    </h2>
                    <div style={{ display:"flex", gap:6 }}>
                      {["1d","5d","7d","1mo","3mo"].map(r => (
                        <button key={r} onClick={()=>setRange(r)} style={{ padding:"4px 10px", borderRadius:7, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", background: range===r?"rgba(201,162,39,0.2)":"rgba(30,58,95,0.4)", borderColor: range===r?"rgba(201,162,39,0.5)":"rgba(201,162,39,0.15)", color: range===r?"#C9A227":"#888" }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ color:"#fff", fontSize:24, fontWeight:700, margin:0 }}>
                      {selected.type==="crypto" ? `$${selected.price.toLocaleString()}` : `$${selected.price.toFixed(2)}`}
                    </p>
                    <p style={{ color: selected.change>=0?"#4CAF50":"#EF4444", fontSize:13, margin:0, fontWeight:600 }}>
                      {selected.change>=0?"▲":"▼"} {Math.abs(selected.change).toFixed(selected.type==="crypto"?0:2)} ({Math.abs(selected.changePercent).toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Chart area */}
                {histLoad ? (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <p style={{ color:"#C9A227" }}>Loading chart...</p>
                  </div>
                ) : (
                  <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
                    <ResponsiveContainer width="100%" height="75%">
                      <ComposedChart data={history}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={selected.change>=0?"#4CAF50":"#EF4444"} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={selected.change>=0?"#4CAF50":"#EF4444"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.08)" />
                        <XAxis dataKey="date" stroke="#555" tick={{ fill:"#777", fontSize:11 }} />
                        <YAxis stroke="#555" tick={{ fill:"#777", fontSize:11 }} domain={["auto","auto"]} width={65}/>
                        <Tooltip contentStyle={{ background:"#0F1F33", border:"1px solid rgba(201,162,39,0.3)", borderRadius:8, color:"#fff" }} formatter={(v:number) => [`$${v.toLocaleString()}`, selected.symbol]} />
                        <Area type="monotone" dataKey="close" stroke={selected.change>=0?"#4CAF50":"#EF4444"} strokeWidth={2} fill="url(#areaGrad)" dot={{ fill:"#C9A227", r:3 }} activeDot={{ r:6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {history.some(d => d.volume) && (
                      <div style={{ marginTop:8 }}>
                        <p style={{ color:"#555", fontSize:10, margin:"0 0 4px" }}>Volume (M)</p>
                        <ResponsiveContainer width="100%" height={60}>
                          <BarChart data={history}>
                            <XAxis dataKey="date" stroke="#555" tick={{ fill:"#666", fontSize:10 }} />
                            <Tooltip contentStyle={{ background:"#0F1F33", border:"1px solid rgba(201,162,39,0.3)", borderRadius:8, color:"#fff" }} formatter={(v:number)=>[`${v}M`,"Volume"]} />
                            <Bar dataKey="volume" fill="rgba(201,162,39,0.35)" radius={[3,3,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuoteCard({ quote, active, onClick }: { quote:Quote; active:boolean; onClick:()=>void }) {
  const up = quote.change >= 0;
  const isCrypto = quote.type === "crypto";
  return (
    <div onClick={onClick} style={{ background: active?"rgba(201,162,39,0.12)":"rgba(15,31,51,0.5)", border:`1px solid ${active?"rgba(201,162,39,0.5)":"rgba(201,162,39,0.1)"}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
      <div style={{ minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <span style={{ fontSize:14 }}>{TYPE_ICONS[quote.type]}</span>
          <span style={{ color:"#C9A227", fontSize:11, fontWeight:700 }}>{quote.symbol}</span>
        </div>
        <p style={{ color:"#aaa", fontSize:10, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{quote.name}</p>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <p style={{ color:"#fff", fontSize:isCrypto?12:14, fontWeight:700, margin:"0 0 2px" }}>
          ${isCrypto ? quote.price.toLocaleString() : quote.price.toFixed(2)}
        </p>
        <p style={{ color: up?"#4CAF50":"#EF4444", fontSize:10, fontWeight:600, margin:0 }}>
          {up?"▲":"▼"}{Math.abs(quote.changePercent).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
