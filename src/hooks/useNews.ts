"use client";

import { useState, useEffect } from "react";
import type { NewsArticle } from "@/types";

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(d => setArticles(d.articles ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { articles, loading, error };
}
