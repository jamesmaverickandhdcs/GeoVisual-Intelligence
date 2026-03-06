"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { NewsArticle } from "@/types";

const SENTIMENT_COLORS: Record<string, string> = { positive: "#4CAF50", neutral: "#C9A227", negative: "#EF4444" };
const CATEGORY_ICONS:  Record<string, string>  = { politics: "🏛️", economy: "📈", conflict: "⚔️", diplomacy: "🤝", other: "📰" };

const FALLBACK_NEWS: NewsArticle[] = [
  { id:"1", title:"US-China Trade Tensions Escalate",    summary_short:"New tariffs on semiconductors. Markets react. Talks scheduled.", summary_long:"", source:"Reuters",   source_url:"https://reuters.com",   country_code:"US", country_name:"United States", latitude:38.9, longitude:-77.0, published_at:new Date().toISOString(), category:"economy",  sentiment:"negative", created_at:new Date().toISOString() },
  { id:"2", title:"Russia-Ukraine Ceasefire Talks",      summary_short:"Istanbul meeting. Limited progress. Next round in March.",       summary_long:"", source:"BBC",       source_url:"https://bbc.com",       country_code:"UA", country_name:"Ukraine",       latitude:50.4, longitude:30.5,  published_at:new Date().toISOString(), category:"conflict",  sentiment:"neutral",  created_at:new Date().toISOString() },
  { id:"3", title:"Middle East Oil Supply Cut Extended", summary_short:"OPEC+ cuts through Q3. Brent crude rises 4%.",                  summary_long:"", source:"Al Jazeera",source_url:"https://aljazeera.com",country_code:"SA", country_name:"Saudi Arabia",  latitude:24.7, longitude:46.7,  published_at:new Date().toISOString(), category:"economy",  sentiment:"negative", created_at:new Date().toISOString() },
  { id:"4", title:"EU Signs Historic Climate Agreement", summary_short:"27 states commit to carbon neutrality by 2040.",               summary_long:"", source:"CNN",       source_url:"https://cnn.com",       country_code:"DE", country_name:"Germany",       latitude:52.5, longitude:13.4,  published_at:new Date().toISOString(), category:"diplomacy", sentiment:"positive", created_at:new Date().toISOString() },
  { id:"5", title:"India-Pakistan Border Tensions Rise", summary_short:"Military buildup along Line of Control. UN calls restraint.",  summary_long:"", source:"The Hindu", source_url:"https://thehindu.com", country_code:"IN", country_name:"India",         latitude:28.6, longitude:77.2,  published_at:new Date().toISOString(), category:"conflict",  sentiment:"negative", created_at:new Date().toISOString() },
  { id:"6", title:"Japan Economy Grows 2.8% in Q1",     summary_short:"Strongest growth in 3 years. Weak yen supports exports.",      summary_long:"", source:"Nikkei",    source_url:"https://nikkei.com",    country_code:"JP", country_name:"Japan",         latitude:35.7, longitude:139.7, published_at:new Date().toISOString(), category:"economy",  sentiment:"positive", created_at:new Date().toISOString() },
];

export default function GeoMap() {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // eslint-disable-line
  const markersRef  = useRef<any[]>([]); // eslint-disable-line
  const [selected,   setSelected]   = useState<NewsArticle | null>(null);
  const [news,       setNews]       = useState<NewsArticle[]>(FALLBACK_NEWS);
  const [filtered,   setFiltered]   = useState<NewsArticle[]>(FALLBACK_NEWS);
  const [loading,    setLoading]    = useState(false);
  const [isLive,     setIsLive]     = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [sidebarOpen,setSidebarOpen]= useState(false);
  // Filters
  const [search,     setSearch]     = useState("");
  const [sentFilter, setSentFilter] = useState("all");
  const [catFilter,  setCatFilter]  = useState("all");

  // Apply filters
  useEffect(() => {
    let f = news;
    if (search)               f = f.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.country_name.toLowerCase().includes(search.toLowerCase()));
    if (sentFilter !== "all") f = f.filter(a => a.sentiment === sentFilter);
    if (catFilter  !== "all") f = f.filter(a => a.category  === catFilter);
    setFiltered(f);
  }, [news, search, sentFilter, catFilter]);

  const addMarkers = useCallback((L: any, map: any, articles: NewsArticle[]) => { // eslint-disable-line
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    articles.forEach((article) => {
      const color = SENTIMENT_COLORS[article.sentiment];
      const icon  = CATEGORY_ICONS[article.category];
      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px ${color}88,0 2px 8px rgba(0,0,0,0.5);cursor:pointer;">${icon}</div>`,
        iconSize:[34,34], iconAnchor:[17,17], popupAnchor:[0,-20],
      });
      const marker = L.marker([article.latitude, article.longitude], { icon: markerIcon });
      marker.bindTooltip(`
        <div style="background:#0F1F33;border:1px solid ${color}55;border-left:3px solid ${color};border-radius:10px;padding:10px 14px;min-width:210px;max-width:270px;color:#fff;font-family:sans-serif;">
          <div style="color:${color};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${icon} ${article.country_name}</div>
          <div style="font-size:12px;font-weight:600;line-height:1.4;margin-bottom:6px;">${article.title}</div>
          <div style="font-size:11px;color:#aaa;line-height:1.4;">${article.summary_short}</div>
        </div>`,
        { permanent:false, direction:"top", className:"gvi-tooltip", offset:[0,-8] }
      );
      marker.on("click", () => { setSelected(article); setSidebarOpen(true); });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    if (mapInstance.current) {
      import("leaflet").then(L => addMarkers(L, mapInstance.current, filtered));
    }
  }, [filtered, addMarkers]);

  const fetchLiveNews = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/news/scrape");
      const data = await res.json();
      if (data.articles?.length > 0) {
        setNews(data.articles);
        setIsLive(true);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current as any; // eslint-disable-line
    if (container._leaflet_id) {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
      delete container._leaflet_id;
    }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link"); link.rel="stylesheet"; link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    import("leaflet").then(L => {
      if (!mapRef.current) return;
      const c = mapRef.current as any; if (c._leaflet_id) return; // eslint-disable-line
      delete (L.Icon.Default.prototype as any)._getIconUrl; // eslint-disable-line
      const map = L.map(mapRef.current, { center:[20,10], zoom:2, minZoom:2, maxZoom:10 });
      mapInstance.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        attribution:'&copy; <a href="https://carto.com/">CARTO</a>',subdomains:"abcd",maxZoom:19,
      }).addTo(map);
      if (!document.querySelector("#gvi-style")) {
        const s = document.createElement("style"); s.id="gvi-style";
        s.textContent=`.leaflet-tile-pane{filter:brightness(1.8) contrast(0.9);}.leaflet-tooltip.gvi-tooltip{background:transparent!important;border:none!important;padding:0!important;box-shadow:0 8px 32px rgba(0,0,0,0.6)!important;}.leaflet-tooltip.gvi-tooltip::before{display:none!important;}.leaflet-control-zoom a{background:#1E3A5F!important;color:#C9A227!important;border-color:#C9A22744!important;}.leaflet-control-zoom a:hover{background:#2E5080!important;}.leaflet-control-attribution{background:rgba(15,31,51,0.8)!important;color:#555!important;font-size:10px!important;}.leaflet-control-attribution a{color:#C9A227!important;}`;
        document.head.appendChild(s);
      }
      addMarkers(L, map, FALLBACK_NEWS);
    });
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current=null; } };
  }, [addMarkers]);

  useEffect(() => { fetchLiveNews(); const t=setInterval(fetchLiveNews,4*60*60*1000); return()=>clearInterval(t); }, [fetchLiveNews]);

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", display:"flex" }}>

      {/* LEFT SIDEBAR */}
      <div style={{ width: sidebarOpen ? 320 : 0, minWidth: sidebarOpen ? 320 : 0, height:"100%", background:"rgba(10,20,40,0.97)", borderRight:"1px solid rgba(201,162,39,0.2)", transition:"all 0.3s", overflow:"hidden", display:"flex", flexDirection:"column", zIndex:500 }}>
        {sidebarOpen && (
          <>
            {/* Sidebar header */}
            <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(201,162,39,0.15)", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <p style={{ color:"#C9A227", fontSize:13, fontWeight:700, margin:0 }}>📰 {filtered.length} Articles</p>
                <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", color:"#666", fontSize:16, cursor:"pointer" }}>✕</button>
              </div>
              {/* Search */}
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search news..." style={{ width:"100%", padding:"8px 10px", background:"rgba(30,58,95,0.5)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:8, color:"#fff", fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
              {/* Filters */}
              <div style={{ display:"flex", gap:6 }}>
                <select value={sentFilter} onChange={e=>setSentFilter(e.target.value)} style={{ flex:1, padding:"6px 8px", background:"rgba(30,58,95,0.5)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:8, color:"#aaa", fontSize:11, outline:"none" }}>
                  <option value="all">All Sentiment</option>
                  <option value="positive">✅ Positive</option>
                  <option value="neutral">🟡 Neutral</option>
                  <option value="negative">🔴 Negative</option>
                </select>
                <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ flex:1, padding:"6px 8px", background:"rgba(30,58,95,0.5)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:8, color:"#aaa", fontSize:11, outline:"none" }}>
                  <option value="all">All Categories</option>
                  <option value="economy">📈 Economy</option>
                  <option value="conflict">⚔️ Conflict</option>
                  <option value="politics">🏛️ Politics</option>
                  <option value="diplomacy">🤝 Diplomacy</option>
                  <option value="other">📰 Other</option>
                </select>
              </div>
            </div>
            {/* Article list */}
            <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
              {filtered.length === 0 ? (
                <p style={{ color:"#555", fontSize:12, textAlign:"center", marginTop:20 }}>No articles match filters</p>
              ) : filtered.map(article => {
                const color = SENTIMENT_COLORS[article.sentiment];
                const isActive = selected?.id === article.id;
                return (
                  <div key={article.id} onClick={()=>setSelected(article)}
                    style={{ padding:"10px 12px", borderRadius:10, marginBottom:6, cursor:"pointer", background: isActive ? "rgba(201,162,39,0.12)" : "rgba(30,58,95,0.3)", border:`1px solid ${isActive ? "rgba(201,162,39,0.4)" : "rgba(201,162,39,0.08)"}`, borderLeft:`3px solid ${color}`, transition:"all 0.15s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:"#C9A227", fontSize:10, fontWeight:700 }}>{CATEGORY_ICONS[article.category]} {article.country_name}</span>
                      <span style={{ color, fontSize:10, fontWeight:700 }}>{article.sentiment}</span>
                    </div>
                    <p style={{ color:"#ddd", fontSize:12, fontWeight:600, lineHeight:1.3, margin:"0 0 4px" }}>{article.title}</p>
                    <p style={{ color:"#777", fontSize:10, margin:0 }}>{article.source}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MAP */}
      <div style={{ flex:1, position:"relative" }}>
        <div ref={mapRef} style={{ width:"100%", height:"100%" }} />

        {/* Toggle sidebar button */}
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ position:"absolute", top:16, left:16, zIndex:1000, background:"rgba(201,162,39,0.15)", border:"1px solid rgba(201,162,39,0.4)", borderRadius:10, padding:"7px 14px", color:"#C9A227", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          {sidebarOpen ? "◀ Hide" : "📰 News List"}
        </button>

        {/* Status badges */}
        <div style={{ position:"absolute", top:16, left: sidebarOpen ? 16 : 140, zIndex:1000, display:"flex", gap:6 }}>
          <div style={{ background:"rgba(201,162,39,0.1)", border:"1px solid rgba(201,162,39,0.3)", borderRadius:10, padding:"5px 12px" }}>
            <p style={{ color:"#C9A227", fontSize:11, fontWeight:700, margin:0 }}>{filtered.length} Events</p>
          </div>
          <div style={{ background: isLive?"rgba(76,175,80,0.1)":"rgba(100,100,100,0.1)", border:`1px solid ${isLive?"rgba(76,175,80,0.3)":"rgba(100,100,100,0.2)"}`, borderRadius:10, padding:"5px 12px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:isLive?"#4CAF50":"#666", display:"inline-block" }} />
            <p style={{ color:isLive?"#4CAF50":"#888", fontSize:11, fontWeight:600, margin:0 }}>
              {loading ? "Fetching..." : isLive ? `Live · ${lastUpdate}` : "Demo"}
            </p>
          </div>
          {!isLive && !loading && (
            <button onClick={fetchLiveNews} style={{ background:"rgba(201,162,39,0.15)", border:"1px solid rgba(201,162,39,0.4)", borderRadius:10, padding:"5px 12px", color:"#C9A227", fontSize:11, fontWeight:600, cursor:"pointer" }}>🔄 Live</button>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ position:"absolute", top:16, right:16, width:290, zIndex:1000, background:"rgba(15,31,51,0.97)", border:"1px solid rgba(201,162,39,0.3)", borderRadius:14, padding:18, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
            <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:"#888", fontSize:16, cursor:"pointer" }}>✕</button>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>{CATEGORY_ICONS[selected.category]}</span>
              <div>
                <p style={{ color:"#C9A227", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:0 }}>{selected.country_name}</p>
                <p style={{ color:"#666", fontSize:10, margin:0 }}>{selected.source}</p>
              </div>
              <span style={{ marginLeft:"auto", fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:700, background:SENTIMENT_COLORS[selected.sentiment]+"22", color:SENTIMENT_COLORS[selected.sentiment] }}>{selected.sentiment}</span>
            </div>
            <h3 style={{ color:"#fff", fontSize:12, fontWeight:700, lineHeight:1.4, marginBottom:8 }}>{selected.title}</h3>
            <p style={{ color:"#aaa", fontSize:11, lineHeight:1.5, marginBottom:12 }}>{selected.summary_short}</p>
            <a href={selected.source_url} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", fontSize:11, background:"rgba(201,162,39,0.1)", border:"1px solid rgba(201,162,39,0.3)", color:"#C9A227", borderRadius:8, padding:"7px", textDecoration:"none" }}>
              Full article → {selected.source}
            </a>
          </div>
        )}

        {/* Legend */}
        <div style={{ position:"absolute", bottom:28, left:16, zIndex:1000, background:"rgba(15,31,51,0.85)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:10, padding:"10px 14px" }}>
          <p style={{ color:"#C9A227", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:"0 0 6px" }}>Sentiment</p>
          {[["positive","#4CAF50"],["neutral","#C9A227"],["negative","#EF4444"]].map(([label,color])=>(
            <div key={label} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:color, display:"inline-block" }} />
              <span style={{ color:"#ccc", fontSize:11, textTransform:"capitalize" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
