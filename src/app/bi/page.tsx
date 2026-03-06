"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import ReactionBar from "@/components/news/ReactionBar";

// Demo analytics data
const SENTIMENT_DATA = [
  { name: "Positive", value: 28, color: "#4CAF50" },
  { name: "Neutral",  value: 45, color: "#C9A227" },
  { name: "Negative", value: 27, color: "#EF4444" },
];

const CATEGORY_DATA = [
  { category: "Economy",  count: 18, fill: "#C9A227" },
  { category: "Conflict", count: 12, fill: "#EF4444" },
  { category: "Politics", count: 15, fill: "#2196F3" },
  { category: "Diplomacy",count: 9,  fill: "#4CAF50" },
  { category: "Other",    count: 6,  fill: "#9E9E9E" },
];

const REACTION_TREND = [
  { day: "Mon", like: 45, dislike: 8,  important: 32, concerned: 18 },
  { day: "Tue", like: 52, dislike: 12, important: 28, concerned: 22 },
  { day: "Wed", like: 38, dislike: 6,  important: 41, concerned: 15 },
  { day: "Thu", like: 61, dislike: 9,  important: 35, concerned: 28 },
  { day: "Fri", like: 48, dislike: 14, important: 29, concerned: 31 },
  { day: "Sat", like: 35, dislike: 5,  important: 22, concerned: 12 },
  { day: "Sun", like: 42, dislike: 7,  important: 38, concerned: 19 },
];

const DIVERSITY_RADAR = [
  { subject: "Economy",   score: 85 },
  { subject: "Conflict",  score: 60 },
  { subject: "Politics",  score: 70 },
  { subject: "Diplomacy", score: 45 },
  { subject: "Regional",  score: 55 },
];

// Demo news for reaction demo
const DEMO_ARTICLES = [
  { id: "demo1", title: "US-China Trade Tensions Escalate", source: "Reuters", sentiment: "negative", category: "economy" },
  { id: "demo2", title: "EU Signs Historic Climate Agreement", source: "CNN", sentiment: "positive", category: "diplomacy" },
  { id: "demo3", title: "India-Pakistan Border Tensions Rise", source: "The Hindu", sentiment: "negative", category: "conflict" },
];

const SENTIMENT_COLORS: Record<string, string> = { positive: "#4CAF50", neutral: "#C9A227", negative: "#EF4444" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ color: "#C9A227", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 14px" }}>
      {children}
    </h2>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "rgba(30,58,95,0.4)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 16, padding: 20, ...style }}>
      {children}
    </div>
  );
}

export default function BIDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "reactions" | "diversity">("analytics");

  // Diversity score calculation (demo)
  const diversityScore = 68;
  const riskLevel = diversityScore > 70 ? "low" : diversityScore > 50 ? "medium" : "high";
  const riskColor = riskLevel === "low" ? "#4CAF50" : riskLevel === "medium" ? "#C9A227" : "#EF4444";

  return (
    <div style={{ minHeight: "100vh", background: "#0F1F33", color: "#fff", fontFamily: "sans-serif", padding: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#C9A227", fontSize: 24, fontWeight: 700, margin: 0 }}>📊 BI Analytics</h1>
          <p style={{ color: "#666", fontSize: 12, margin: "4px 0 0" }}>Community Intelligence Dashboard</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/map"       style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>← Map</a>
          <a href="/dashboard" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>💹 Finance</a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { key: "analytics",  label: "📈 Sentiment" },
          { key: "reactions",  label: "👍 Reactions" },
          { key: "diversity",  label: "🧭 Echo Chamber" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              background: activeTab === tab.key ? "rgba(201,162,39,0.2)" : "rgba(30,58,95,0.4)",
              border: `1px solid ${activeTab === tab.key ? "rgba(201,162,39,0.5)" : "rgba(201,162,39,0.15)"}`,
              borderRadius: 10, padding: "8px 16px", color: activeTab === tab.key ? "#C9A227" : "#888",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Sentiment Analytics */}
      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <SectionTitle>Sentiment Distribution</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={SENTIMENT_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {SENTIMENT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0F1F33", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ color: "#aaa", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle>News by Category</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                <XAxis type="number" stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis type="category" dataKey="category" stroke="#555" tick={{ fill: "#aaa", fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#0F1F33", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Stats row */}
          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionTitle>Today&apos;s Summary</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Total Articles", value: "60", icon: "📰", color: "#C9A227" },
                { label: "Positive News",  value: "17", icon: "✅", color: "#4CAF50" },
                { label: "Conflict News",  value: "12", icon: "⚔️", color: "#EF4444" },
                { label: "Active Users",   value: "248",icon: "👥", color: "#2196F3" },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center", padding: "12px 0" }}>
                  <p style={{ fontSize: 28, margin: "0 0 4px" }}>{stat.icon}</p>
                  <p style={{ color: stat.color, fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>{stat.value}</p>
                  <p style={{ color: "#888", fontSize: 11, margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Reactions */}
      {activeTab === "reactions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionTitle>Reaction Trends (7 Days)</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={REACTION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
                <XAxis dataKey="day" stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0F1F33", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8, color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#aaa", fontSize: 12 }} />
                <Bar dataKey="like"      fill="#4CAF50" radius={[4,4,0,0]} />
                <Bar dataKey="important" fill="#C9A227" radius={[4,4,0,0]} />
                <Bar dataKey="concerned" fill="#FF9800" radius={[4,4,0,0]} />
                <Bar dataKey="dislike"   fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Live reaction demo */}
          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionTitle>Live Reaction Demo</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DEMO_ARTICLES.map(article => (
                <div key={article.id} style={{ borderBottom: "1px solid rgba(201,162,39,0.1)", paddingBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: SENTIMENT_COLORS[article.sentiment] + "22", color: SENTIMENT_COLORS[article.sentiment] }}>{article.sentiment}</span>
                    <span style={{ color: "#666", fontSize: 11 }}>{article.source}</span>
                  </div>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{article.title}</p>
                  <ReactionBar newsId={article.id} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Echo Chamber */}
      {activeTab === "diversity" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <SectionTitle>Your Diversity Score</SectionTitle>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <svg width={160} height={160} viewBox="0 0 160 160">
                  <circle cx={80} cy={80} r={65} fill="none" stroke="rgba(201,162,39,0.1)" strokeWidth={14} />
                  <circle cx={80} cy={80} r={65} fill="none" stroke={riskColor} strokeWidth={14}
                    strokeDasharray={`${(diversityScore / 100) * 408} 408`}
                    strokeLinecap="round" transform="rotate(-90 80 80)" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <p style={{ color: riskColor, fontSize: 32, fontWeight: 700, margin: 0 }}>{diversityScore}</p>
                  <p style={{ color: "#888", fontSize: 11, margin: 0 }}>/ 100</p>
                </div>
              </div>
              <p style={{ color: riskColor, fontSize: 14, fontWeight: 700, marginTop: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {riskLevel === "low" ? "✅ Low Echo Risk" : riskLevel === "medium" ? "⚠️ Medium Echo Risk" : "🚨 High Echo Risk"}
              </p>
              <p style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                You read news from {DIVERSITY_RADAR.filter(d => d.score > 50).length} different categories
              </p>
            </div>
          </Card>

          <Card>
            <SectionTitle>Category Coverage</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={DIVERSITY_RADAR}>
                <PolarGrid stroke="rgba(201,162,39,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#aaa", fontSize: 11 }} />
                <Radar name="Coverage" dataKey="score" stroke="#C9A227" fill="#C9A227" fillOpacity={0.2} />
                <Tooltip contentStyle={{ background: "#0F1F33", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8, color: "#fff" }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionTitle>Recommendations to Diversify</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { icon: "🤝", title: "Read more Diplomacy", desc: "You rarely read diplomatic news. Try Al Jazeera or Reuters.", color: "#4CAF50" },
                { icon: "🌏", title: "Explore Asia-Pacific", desc: "Most of your news is US/Europe focused. Try NHK or SCMP.", color: "#2196F3" },
                { icon: "📊", title: "Follow Economic news", desc: "Balance conflict news with economic analysis.", color: "#C9A227" },
              ].map(tip => (
                <div key={tip.title} style={{ background: "rgba(15,31,51,0.5)", border: `1px solid ${tip.color}33`, borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 24, margin: "0 0 8px" }}>{tip.icon}</p>
                  <p style={{ color: tip.color, fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>{tip.title}</p>
                  <p style={{ color: "#888", fontSize: 11, lineHeight: 1.5, margin: 0 }}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
