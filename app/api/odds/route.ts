/**
 * API Route: Get Latest Normalized Odds
 * Returns cached odds from last refresh (no API credit used)
 */

import { getMockOdds, normalizeMarkets } from "@/app/lib/oddsApi";

export const runtime = "nodejs";
export const revalidate = 3600; // Cache for 1 hour

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = (searchParams.get("sport") || "nfl") as any;

    // In production, fetch from database cache
    // For now, use mock data
    const games = getMockOdds();
    const markets = normalizeMarkets(games, sport);

    // Filter by sport if specified
    const filtered =
      sport === "all"
        ? markets
        : markets.filter((m) => m.sport === sport);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      sport,
      count: filtered.length,
      markets: filtered.slice(0, 50), // Return top 50
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
