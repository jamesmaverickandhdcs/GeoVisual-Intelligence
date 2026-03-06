-- GeoVisual Intelligence v7.0 — Database Schema
-- Run this in Supabase SQL Editor

-- =====================
-- 1. NEWS ARTICLES
-- =====================
CREATE TABLE IF NOT EXISTS news_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  summary_short   TEXT,
  summary_long    TEXT,
  source          TEXT NOT NULL,
  source_url      TEXT NOT NULL,
  country_code    VARCHAR(3),
  country_name    TEXT,
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  published_at    TIMESTAMPTZ,
  category        TEXT CHECK (category IN ('politics','economy','conflict','diplomacy','other')),
  sentiment       TEXT CHECK (sentiment IN ('positive','neutral','negative')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. STOCK IMPACTS
-- =====================
CREATE TABLE IF NOT EXISTS stock_impacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id         UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL,
  name            TEXT,
  price           DECIMAL(12,4),
  change          DECIMAL(10,4),
  change_percent  DECIMAL(8,4),
  type            TEXT CHECK (type IN ('stock','oil','gold')),
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. USER REACTIONS
-- =====================
CREATE TABLE IF NOT EXISTS user_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id         UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction        TEXT CHECK (reaction IN ('like','dislike','important','surprised','concerned')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id)
);

-- =====================
-- 4. ACTIVITY LOGS (BI)
-- =====================
CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 5. ROW LEVEL SECURITY
-- =====================
ALTER TABLE news_articles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_impacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;

-- Public read for news & stocks
CREATE POLICY "Public read news"   ON news_articles  FOR SELECT USING (true);
CREATE POLICY "Public read stocks" ON stock_impacts  FOR SELECT USING (true);

-- Users can manage own reactions
CREATE POLICY "Own reactions"      ON user_reactions FOR ALL  USING (auth.uid() = user_id);

-- Users can read own logs
CREATE POLICY "Own logs"           ON activity_logs  FOR SELECT USING (auth.uid() = user_id);

-- =====================
-- 6. AUTO-ARCHIVE (6 months)
-- =====================
CREATE OR REPLACE FUNCTION archive_old_news() RETURNS void AS $$
BEGIN
  DELETE FROM news_articles
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
