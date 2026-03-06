"use client";

import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/map",       label: "🌐 Map" },
  { href: "/dashboard", label: "💹 Finance" },
  { href: "/bi",        label: "📊 BI Analytics" },
  { href: "/auth",      label: "🔐 Login" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 24px", borderBottom: "1px solid rgba(201,162,39,0.2)",
      background: "rgba(15,31,51,0.97)", backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 9999,
    }}>
      {/* Logo */}
      <a href="/map" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 22 }}>🌍</span>
        <div>
          <p style={{ color: "#C9A227", fontWeight: 700, fontSize: 16, margin: 0, lineHeight: 1 }}>GeoVisual Intelligence</p>
          <p style={{ color: "#555", fontSize: 10, margin: 0 }}>v7.0 · HDCS Geeks</p>
        </div>
      </a>

      {/* Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.href;
          return (
            <a key={link.href} href={link.href} style={{
              color: active ? "#C9A227" : "#888",
              fontSize: 13, fontWeight: active ? 700 : 400,
              textDecoration: "none", padding: "6px 14px", borderRadius: 8,
              background: active ? "rgba(201,162,39,0.12)" : "transparent",
              border: active ? "1px solid rgba(201,162,39,0.3)" : "1px solid transparent",
              transition: "all 0.15s",
            }}>
              {link.label}
            </a>
          );
        })}
      </div>

      {/* Status dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block", boxShadow: "0 0 6px #4CAF50" }} />
        <span style={{ color: "#4CAF50", fontSize: 11, fontWeight: 600 }}>Live</span>
      </div>
    </nav>
  );
}
