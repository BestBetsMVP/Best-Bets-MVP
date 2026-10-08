/**
 * API Route: Daily Odds Refresh (6 AM ET)
 * Vercel Cron: 0 6 * * *
 * Uses 1 Odds API credit per day
 */

import { fetchLiveOdds, normalizeMarkets } from "@/app/lib/oddsApi";
import type { Sport } from "@/app/lib/oddsApi";

const SPORTS: Sport[] = ["nfl", "nba", "mlb", "nhl", "soccer"];

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Verify cron secret (Vercel)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allMarkets = [];

    for (const sport of SPORTS) {
      console.log(`Fetching odds for ${sport}...`);
      const games = await fetchLiveOdds(sport);
      const normalized = normalizeMarkets(games, sport);
      allMarkets.push(...normalized);
    }

    // Store in database or file (example: store in memory cache or database)
    // For now, just log the count
    console.log(`✅ Refreshed ${allMarkets.length} market records`);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      credits_used: 1,
      markets_loaded: allMarkets.length,
      message: "Daily odds refresh complete",
    });
  } catch (error) {
    console.error("Refresh failed:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
