# GeoVisual Intelligence v7.0

**AI-Powered Global Geopolitical Mapping, Summarization & Stock Market Impact Analysis**

Team: HDCS Geeks | AI Partner: Claude AI

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your API keys
cp .env.example .env.local

# 3. Run Supabase migration
# → Go to Supabase Dashboard → SQL Editor
# → Paste contents of supabase/migrations/001_initial_schema.sql

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
GVI7/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── news/           # News scraping endpoint
│   │   │   ├── summarize/      # Gemini AI summarization
│   │   │   ├── stocks/         # Yahoo Finance data
│   │   │   └── reactions/      # User reactions
│   │   ├── map/                # Interactive geopolitical map
│   │   ├── dashboard/          # BI analytics dashboard
│   │   └── auth/               # Authentication pages
│   ├── components/
│   │   ├── map/                # Map + pins + tooltips
│   │   ├── news/               # News cards + summaries
│   │   ├── financial/          # Stock charts
│   │   ├── dashboard/          # BI charts & analytics
│   │   └── ui/                 # Shared UI components
│   ├── lib/
│   │   ├── supabase/           # DB client
│   │   ├── gemini/             # AI summarization
│   │   └── yahoo-finance/      # Stock data
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript interfaces
│   └── styles/                 # Global CSS
├── supabase/
│   └── migrations/             # SQL schema files
├── public/
├── .env.local                  # API keys (never commit!)
└── package.json
```

---

## API Keys Required

| Service | Where to get |
|---------|-------------|
| Supabase | supabase.com → Project Settings |
| Gemini AI | aistudio.google.com |
| NewsAPI | newsapi.org |
| Resend | resend.com |
| Telegram Bot | @BotFather on Telegram |

---

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript) + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Supabase (PostgreSQL) + Edge Functions
- **AI**: Google Gemini 1.5 Flash
- **Map**: Leaflet.js + React Leaflet
- **Charts**: Recharts
- **Hosting**: Vercel
- **Email**: Resend API

---

## Development Plan

See `GeoVisual_Intelligence_14Day_Plan.pdf` for full 14-day session breakdown.
