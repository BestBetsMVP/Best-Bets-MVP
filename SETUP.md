# Setup Instructions

## 1. Get The Odds API Key

**Visit:** https://the-odds-api.com/

- Sign up (free tier available)
- Copy your API key
- Free tier: $0.01 per request

## 2. Configure Environment Variables

### Local Development

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
ODDS_API_KEY=your_actual_key_here
ODDS_API_BASE=https://api.the-odds-api.com/v4
CRON_SECRET=generate_secure_random_string
```

**Don't commit `.env.local` to Git!**

### Production (Vercel)

1. Go to Vercel dashboard
2. Project settings → Environment Variables
3. Add:
   - `ODDS_API_KEY` = your actual key
   - `CRON_SECRET` = random secure string

## 3. Deploy to Vercel

```bash
npm install
npm run build
vercel deploy
```

## 4. Test the Setup

### Manual Cron Trigger

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/refresh-odds
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2026-10-08T06:00:00Z",
  "credits_used": 1,
  "markets_loaded": 1200
}
```

### Query Live Odds

```bash
curl https://your-domain.vercel.app/api/odds?sport=nfl
```

## 5. Daily Refresh Schedule

**Cron Job:** `0 6 * * *` (6:00 AM UTC)

- Automatically triggered by Vercel
- Uses 1 API credit
- Normalizes odds from 10+ sportsbooks
- Caches results for unlimited queries

## Architecture Overview

```
┌─ 6:00 AM ET (Vercel Cron)
│
├─ /api/refresh-odds
│  └─ Calls: The Odds API (1 credit)
│     └─ Returns: Live odds from DraftKings, FanDuel, BetMGM, etc.
│        └─ Normalize: Convert to unified format
│           └─ Store: Cache in database
│
├─ Users query: /api/odds?sport=nfl
│  └─ Returns: Cached markets (0 credits)
│     └─ Dashboard renders: Top picks, best value
│        └─ Slip builder: Custom lineup
│           └─ Monte Carlo: Probability simulation
```

## File Structure

```
app/
├── page.tsx              # Main dashboard UI (NEW VERSION)
├── page-v2.tsx           # Enhanced dashboard with full features
├── lib/
│   ├── oddsApi.ts        # The Odds API integration
│   ├── analytics.ts      # EV, edge, scoring calculations
│   └── database.ts       # Pick history & stats
├── api/
│   ├── refresh-odds/     # Daily 6 AM cron job
│   └── odds/             # Cached query endpoint
├── public/               # Static assets
└── package.json

vercel.json              # Cron configuration
.env.local              # Local env (DO NOT COMMIT)
.env.local.example      # Template for env vars
```

## What Each Component Does

### `app/lib/oddsApi.ts`
- Connects to The Odds API
- Fetches live odds from sportsbooks
- Normalizes to unified format
- Handles errors gracefully

### `app/lib/analytics.ts`
- Calculates edge (actual prob - implied prob)
- Computes expected value (EV)
- Scores markets by value
- Runs Monte Carlo simulations
- Finds best odds across books

### `app/lib/database.ts`
- Stores daily snapshots
- Tracks user picks
- Calculates win rate & ROI
- Provides pick history

### `app/api/refresh-odds/route.ts`
- Vercel cron job (6 AM ET)
- Calls The Odds API (1 credit)
- Normalizes all markets
- Saves to cache/database

### `app/api/odds/route.ts`
- Query endpoint (0 credits)
- Returns cached markets
- Filters by sport
- No rate limiting

### `app/page-v2.tsx`
- Modern dashboard UI
- Sport filter (NFL, NBA, MLB, etc.)
- Best value picks board
- Slip builder
- Monte Carlo simulation
- User stats tracking

## Cost Estimation

| Item | Cost | Frequency |
|------|------|----------|
| API calls | $0.01 | 1/day |
| Vercel hosting | Free | Unlimited |
| Bandwidth | Free (free tier) | Unlimited |
| Database | Free (Supabase) | Unlimited |
| **Monthly Total** | **~$0.30** | — |

## Troubleshooting

### "API Key not found"
- Check `.env.local` exists in root
- Verify `ODDS_API_KEY` is set correctly
- Restart dev server: `npm run dev`

### "Cron job not running"
- Verify `vercel.json` exists
- Check Vercel dashboard → Cron Jobs
- Manually trigger to test

### "0 markets loaded"
- Check API key is valid
- Verify internet connection
- Check The Odds API status page
- Review API rate limits

### "Database connection error"
- Supabase connection string is required for production
- Development uses in-memory mock database
- No data persists between restarts

## Next Steps

1. ✅ Add The Odds API key
2. ✅ Deploy to Vercel
3. ⏭️ Add real database (Supabase)
4. ⏭️ Build pick performance tracker
5. ⏭️ Add live line movement alerts
6. ⏭️ Integrate with Stripe for premium features

## Support

- **The Odds API:** https://the-odds-api.com/
- **Vercel Docs:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs

---

**© 2026 Best Bets MVP** - Analytical Research Only. Not a Gambling Service.
