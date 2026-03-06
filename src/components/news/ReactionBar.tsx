"use client";

import { useState, useEffect } from "react";

interface ReactionProps {
  newsId: string;
  userId?: string;
}

const REACTIONS = [
  { key: "like",      emoji: "👍", label: "Like" },
  { key: "dislike",   emoji: "👎", label: "Dislike" },
  { key: "important", emoji: "❗", label: "Important" },
  { key: "surprised", emoji: "😮", label: "Surprised" },
  { key: "concerned", emoji: "😟", label: "Concerned" },
];

interface ReactionCount {
  like: number;
  dislike: number;
  important: number;
  surprised: number;
  concerned: number;
}

export default function ReactionBar({ newsId, userId = "guest" }: ReactionProps) {
  const [counts,   setCounts]   = useState<ReactionCount>({ like: 0, dislike: 0, important: 0, surprised: 0, concerned: 0 });
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [animating,  setAnimating]  = useState<string | null>(null);

  // Load from localStorage (Supabase Day 10 မှာ ချိတ်မယ်)
  useEffect(() => {
    const stored = localStorage.getItem(`reaction_${newsId}`);
    if (stored) setMyReaction(stored);

    const countStored = localStorage.getItem(`reaction_counts_${newsId}`);
    if (countStored) setCounts(JSON.parse(countStored));
    else {
      // Seed with random demo counts
      const demo = {
        like:      Math.floor(Math.random() * 40) + 5,
        dislike:   Math.floor(Math.random() * 10) + 1,
        important: Math.floor(Math.random() * 25) + 3,
        surprised: Math.floor(Math.random() * 15) + 2,
        concerned: Math.floor(Math.random() * 20) + 4,
      };
      setCounts(demo);
      localStorage.setItem(`reaction_counts_${newsId}`, JSON.stringify(demo));
    }
  }, [newsId]);

  function handleReaction(key: string) {
    setAnimating(key);
    setTimeout(() => setAnimating(null), 400);

    const newCounts = { ...counts };

    if (myReaction === key) {
      // Undo reaction
      newCounts[key as keyof ReactionCount] = Math.max(0, newCounts[key as keyof ReactionCount] - 1);
      setMyReaction(null);
      localStorage.removeItem(`reaction_${newsId}`);
    } else {
      // Remove old reaction
      if (myReaction) {
        newCounts[myReaction as keyof ReactionCount] = Math.max(0, newCounts[myReaction as keyof ReactionCount] - 1);
      }
      // Add new reaction
      newCounts[key as keyof ReactionCount] += 1;
      setMyReaction(key);
      localStorage.setItem(`reaction_${newsId}`, key);
    }

    setCounts(newCounts);
    localStorage.setItem(`reaction_counts_${newsId}`, JSON.stringify(newCounts));
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {REACTIONS.map(({ key, emoji, label }) => {
          const isActive = myReaction === key;
          const isAnim   = animating === key;
          const count    = counts[key as keyof ReactionCount];
          return (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              title={label}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: isActive ? "rgba(201,162,39,0.2)" : "rgba(30,58,95,0.5)",
                border: `1px solid ${isActive ? "rgba(201,162,39,0.6)" : "rgba(201,162,39,0.15)"}`,
                borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: "#fff",
                fontSize: 12, fontWeight: isActive ? 700 : 400,
                transform: isAnim ? "scale(1.25)" : "scale(1)",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              <span style={{ color: isActive ? "#C9A227" : "#aaa" }}>{count}</span>
            </button>
          );
        })}
      </div>
      <p style={{ color: "#555", fontSize: 10, margin: "6px 0 0" }}>{total} total reactions</p>
    </div>
  );
}
