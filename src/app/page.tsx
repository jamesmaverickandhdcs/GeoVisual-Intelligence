"use client";

import { useState, useEffect } from "react";

const FEATURES = [
  { icon:"🌍", title:"Live Geopolitical Map",    desc:"Real-time news pins on interactive world map. Zoom, pan, and click for AI summaries." },
  { icon:"🤖", title:"Gemini AI Summaries",      desc:"Every article summarized in 3 and 10 sentences by Google Gemini 1.5 Flash." },
  { icon:"💹", title:"Financial Impact",         desc:"Track how geopolitical events move stocks, oil, and gold prices in real time." },
  { icon:"📊", title:"BI Analytics",             desc:"Sentiment trends, reaction analytics, and echo chamber detection dashboard." },
  { icon:"🔔", title:"Telegram Alerts",          desc:"Instant Telegram notifications for breaking geopolitical events." },
  { icon:"📧", title:"Daily Email Brief",        desc:"Beautiful HTML newsletter delivered to your inbox every morning." },
];

const STATS = [
  { value:"6+",   label:"Data Sources" },
  { value:"AI",   label:"Gemini Powered" },
  { value:"Live", label:"Real-time News" },
  { value:"Free", label:"Open Source" },
];

export default function LandingPage() {
  const [tick, setTick] = useState(0);
  const headlines = [
    "US-China Trade Tensions Escalate",
    "EU Signs Historic Climate Agreement",
    "OPEC+ Extends Oil Production Cuts",
    "Russia-Ukraine Ceasefire Talks Resume",
    "Japan Economy Grows 2.8% in Q1",
  ];

  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % headlines.length), 3000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <div style={{ minHeight:"100%", background:"#0A1628", color:"#fff", fontFamily:"sans-serif", overflowX:"hidden" }}>

      {/* HERO */}
      <section style={{ minHeight:"90vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"40px 24px", position:"relative", overflow:"hidden" }}>

        {/* Background glow */}
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", left:"10%", width:300, height:300, background:"radial-gradient(circle, rgba(33,150,243,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,162,39,0.1)", border:"1px solid rgba(201,162,39,0.3)", borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#4CAF50", display:"inline-block", boxShadow:"0 0 6px #4CAF50" }} />
          <span style={{ color:"#C9A227", fontSize:12, fontWeight:600 }}>Live · AI-Powered · v7.0</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize:"clamp(32px, 6vw, 72px)", fontWeight:800, margin:"0 0 16px", lineHeight:1.1, maxWidth:800 }}>
          <span style={{ color:"#C9A227" }}>GeoVisual</span>
          <br />
          <span style={{ color:"#ffffff" }}>Intelligence</span>
        </h1>

        <p style={{ color:"#888", fontSize:"clamp(14px, 2vw, 18px)", maxWidth:560, lineHeight:1.7, margin:"0 0 32px" }}>
          AI-powered geopolitical mapping platform. Track global events, analyze financial impact, and stay ahead of the world.
        </p>

        {/* Live ticker */}
        <div style={{ background:"rgba(30,58,95,0.4)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:12, padding:"10px 20px", marginBottom:36, maxWidth:500, width:"100%" }}>
          <p style={{ color:"#555", fontSize:11, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>📰 Latest Event</p>
          <p style={{ color:"#C9A227", fontSize:14, fontWeight:600, margin:0, transition:"all 0.5s" }}>{headlines[tick]}</p>
        </div>

        {/* CTA buttons */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          <a href="/map" style={{ background:"rgba(201,162,39,0.9)", color:"#0A1628", fontWeight:700, fontSize:15, padding:"14px 32px", borderRadius:12, textDecoration:"none", transition:"all 0.2s", boxShadow:"0 4px 20px rgba(201,162,39,0.3)" }}>
            🌍 Launch Map →
          </a>
          <a href="/dashboard" style={{ background:"rgba(30,58,95,0.6)", color:"#C9A227", fontWeight:600, fontSize:15, padding:"14px 32px", borderRadius:12, textDecoration:"none", border:"1px solid rgba(201,162,39,0.3)" }}>
            💹 View Finance
          </a>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:"rgba(30,58,95,0.3)", borderTop:"1px solid rgba(201,162,39,0.1)", borderBottom:"1px solid rgba(201,162,39,0.1)", padding:"32px 24px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, textAlign:"center" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ color:"#C9A227", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, margin:"0 0 4px" }}>{s.value}</p>
              <p style={{ color:"#666", fontSize:12, margin:0, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"60px 24px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ color:"#C9A227", fontSize:"clamp(22px,4vw,36px)", fontWeight:700, margin:"0 0 10px" }}>Everything You Need</h2>
          <p style={{ color:"#666", fontSize:14 }}>Built for analysts, researchers, and curious minds</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background:"rgba(30,58,95,0.35)", border:"1px solid rgba(201,162,39,0.15)", borderRadius:16, padding:24, transition:"all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.border="1px solid rgba(201,162,39,0.4)")}
              onMouseLeave={e => (e.currentTarget.style.border="1px solid rgba(201,162,39,0.15)")}
            >
              <p style={{ fontSize:32, margin:"0 0 12px" }}>{f.icon}</p>
              <h3 style={{ color:"#fff", fontSize:15, fontWeight:700, margin:"0 0 8px" }}>{f.title}</h3>
              <p style={{ color:"#777", fontSize:13, lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding:"40px 24px 60px", maxWidth:800, margin:"0 auto", textAlign:"center" }}>
        <h2 style={{ color:"#C9A227", fontSize:20, fontWeight:700, margin:"0 0 24px" }}>Built With</h2>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
          {["Next.js 14","TypeScript","Leaflet.js","Gemini AI","Yahoo Finance","NewsAPI","Supabase","Recharts","Tailwind CSS","Resend","Telegram Bot"].map(tech => (
            <span key={tech} style={{ background:"rgba(30,58,95,0.5)", border:"1px solid rgba(201,162,39,0.2)", borderRadius:20, padding:"6px 14px", color:"#aaa", fontSize:12 }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(201,162,39,0.1)", padding:"24px", textAlign:"center" }}>
        <p style={{ color:"#333", fontSize:12, margin:0 }}>
          GeoVisual Intelligence v7.0 · Built by <span style={{ color:"#C9A227" }}>HDCS Geeks</span> · Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}
