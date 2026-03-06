export interface NewsArticle {
  id: string;
  title: string;
  summary_short: string;
  summary_long: string;
  source: string;
  source_url: string;
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  published_at: string;
  category: "politics" | "economy" | "conflict" | "diplomacy" | "other";
  sentiment: "positive" | "neutral" | "negative";
  created_at: string;
}

export interface StockImpact {
  id: string;
  news_id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  type: "stock" | "oil" | "gold";
}

export interface UserReaction {
  id: string;
  news_id: string;
  user_id: string;
  reaction: "like" | "dislike" | "important" | "surprised" | "concerned";
  created_at: string;
}

export interface DiversityScore {
  user_id: string;
  score: number;
  categories_viewed: string[];
  echo_chamber_risk: "low" | "medium" | "high";
}
