# Best Bets MVP - Legal Sports Prediction Dashboard

## Overview

A personal-use sports betting analysis app that pulls **live odds from The Odds API** once daily (6 AM ET) using **1 API credit per day**.

## Data Sources

- **The Odds API** - Legal, authorized access to 10+ sportsbooks
  - DraftKings, FanDuel, BetMGM, Caesars, PointsBet, etc.
  - Spreads, moneylines, totals
  - Updated once per day (6 AM ET)

## Features

✅ **Legal & Safe**
- Uses only authorized APIs (The Odds API)
- No scraping or unauthorized data collection
- Full compliance with sportsbook ToS

✅ **Efficient**
- 1 credit/day = ~$0.01 cost
- Cron-scheduled daily refresh (Vercel)
- Cached results serve unlimited queries

✅ **Smart Analysis**
- Multi-book odds comparison
- Implied probability calculation
- Expected value (EV) detection
- Confidence scoring
- Risk classification

✅ **Modern UI**
- Dark sportsbook aesthetic
- Live prediction board
- Slip builder
- Monte Carlo simulations

## Setup

### 1. Get The Odds API Key

```bash
# Visit https://the-odds-api.com/
# Sign up for free ($0.01 per request)
# Copy your API key
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local

# Add your API key
echo "ODDS_API_KEY=your_key_here" >> .env.local
echo "CRON_SECRET=your_secure_random_string" >> .env.local
```

### 3. Deploy to Vercel

```bash
npm install
vercel deploy

# Set environment variables in Vercel dashboard
# Enable cron jobs in vercel.json
```

### 4. Test Daily Refresh

```bash
# Manual trigger (replace with your Vercel URL)
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/refresh-odds

# Get latest odds
curl https://your-domain.vercel.app/api/odds?sport=nfl
```

## Architecture

```
app/
├── page.tsx              # Main dashboard UI
├── lib/
│   ├── oddsApi.ts        # The Odds API integration
│   └── marketData.ts     # Market normalization & calculations
└── api/
    ├── refresh-odds/     # Daily 6 AM cron job (1 credit)
    └── odds/             # Cached query endpoint (0 credits)
```

## Daily Workflow

1. **6:00 AM ET** → Vercel cron triggers `/api/refresh-odds`
2. **The Odds API** → Returns live odds from 10+ sportsbooks (1 credit)
3. **Normalize** → Convert to unified market format
4. **Store** → Cache in database/file
5. **Dashboard** → Users query `/api/odds` (no additional credits)
6. **Build Slips** → Add picks to custom lineup builder
7. **Simulate** → Monte Carlo probability analysis

## Cost Breakdown

| Component | Cost | Frequency |
|-----------|------|----------|
| API Calls | $0.01 | 1x daily |
| Hosting | Free (Vercel) | Unlimited |
| Database | Free (Supabase) | Unlimited |
| **Monthly Total** | **~$0.30** | — |

## Legal Compliance

✅ **The Odds API Terms**
- Legal data aggregator with sportsbook partnerships
- Fully compliant with affiliate agreements
- No unauthorized scraping or ToS violations

✅ **Personal Use**
- This is analytical software for your own research
- Not a gambling service or betting platform
- Educational and entertainment purposes only

## Responsible Gambling

⚠️ **Important Disclaimers**
- These are predictions, not guarantees
- Past performance ≠ future results
- Never bet money you can't afford to lose
- Seek help: 1-800-GAMBLER (1-800-426-2537)

## Next Steps

1. ✅ Wire up The Odds API key
2. ✅ Deploy to Vercel with cron
3. ✅ Connect dashboard to live data
4. ✅ Add database for historical tracking
5. ✅ Build pick performance tracker

## Support

- The Odds API: https://the-odds-api.com/
- Next.js Cron: https://vercel.com/docs/cron-jobs
- Vercel Deployment: https://vercel.com/docs

---

**© 2026 Best Bets MVP** - Analytical Predictions Only. Not a Gambling Service.
