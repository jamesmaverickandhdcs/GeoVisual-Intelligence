"use client";

import type { NewsArticle } from "@/types";
import { formatDate } from "@/lib/utils";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#4CAF50",
  neutral:  "#C9A227",
  negative: "#EF4444",
};

const CATEGORY_ICONS: Record<string, string> = {
  politics:  "🏛️",
  economy:   "📈",
  conflict:  "⚔️",
  diplomacy: "🤝",
  other:     "📰",
};

interface NewsCardProps {
  article: NewsArticle;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function NewsCard({ article, expanded, onToggle }: NewsCardProps) {
  const color = SENTIMENT_COLORS[article.sentiment];

  return (
    <div
      className="bg-navy/60 border border-gold/20 rounded-xl p-4 hover:border-gold/50 transition-all cursor-pointer group"
      onClick={onToggle}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{CATEGORY_ICONS[article.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">
              {article.country_name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: color + "22", color }}
            >
              {article.sentiment}
            </span>
            <span className="text-gray-500 text-xs ml-auto">
              {formatDate(article.published_at)}
            </span>
          </div>

          <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-gold transition">
            {article.title}
          </h3>

          <p className="text-gray-400 text-xs leading-relaxed">
            {expanded ? article.summary_long || article.summary_short : article.summary_short}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-500 text-xs">{article.source}</span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-gold text-xs hover:underline"
            >
              Source →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
