"use client";

import { useState } from "react";

export default function AuthPage() {
  const [mode,     setMode]     = useState<"login" | "register">("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    // Supabase auth — Day 10 မှာ ချိတ်မယ်
    await new Promise(r => setTimeout(r, 800));
    setMessage(mode === "login"
      ? "✅ Login successful! (Supabase auth Day 10 မှာ ချိတ်မည်)"
      : "✅ Account created! (Supabase auth Day 10 မှာ ချိတ်မည်)"
    );
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F1F33", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(30,58,95,0.4)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 20, padding: 36 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 36, margin: "0 0 8px" }}>🌍</p>
          <h1 style={{ color: "#C9A227", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>GeoVisual Intelligence</h1>
          <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{mode === "login" ? "Sign in to your account" : "Create a new account"}</p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "rgba(15,31,51,0.5)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: mode === m ? "rgba(201,162,39,0.2)" : "transparent",
              color: mode === m ? "#C9A227" : "#888",
              transition: "all 0.15s",
            }}>
              {m === "login" ? "🔐 Login" : "✨ Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div>
              <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="James Maverick"
                style={{ width: "100%", padding: "10px 14px", background: "rgba(15,31,51,0.6)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}
          <div>
            <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "10px 14px", background: "rgba(15,31,51,0.6)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", background: "rgba(15,31,51,0.6)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{ padding: "12px 0", background: loading ? "rgba(201,162,39,0.3)" : "rgba(201,162,39,0.85)", border: "none", borderRadius: 10, color: "#0F1F33", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s", marginTop: 4 }}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          {message && (
            <div style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 10, padding: "10px 14px", color: "#4CAF50", fontSize: 12, textAlign: "center" }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
