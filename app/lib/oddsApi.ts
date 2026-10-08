/**
 * The Odds API Integration
 * Legal, authorized data source for live sportsbook odds
 * https://the-odds-api.com/
 */

export type Sport = "nfl" | "nba" | "mlb" | "soccer" | "nhl";

export interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

export interface NormalizedMarket {
  id: string;
  sport: Sport;
  matchup: string;
  market: "spread" | "moneyline" | "total" | "player_prop";
  line: string;
  price: number;
  book: string;
  probability: number;
  timestamp: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  player?: string;
  stat?: string;
  homeTeam?: string;
  awayTeam?: string;
}

const API_KEY = process.env.ODDS_API_KEY;
const API_BASE = process.env.ODDS_API_BASE || "https://api.the-odds-api.com/v4";

/**
 * Fetch live odds from The Odds API (1 credit per call)
 * Call this once daily at 6 AM ET
 */
export async function fetchLiveOdds(sport: Sport): Promise<OddsAPIGame[]> {
  if (!API_KEY) {
    console.warn("ODDS_API_KEY not set. Using mock data.");
    return getMockOdds();
  }

  try {
    const url = `${API_BASE}/sports/${sport}/odds`;
    const params = new URLSearchParams({
      apiKey: API_KEY,
      regions: "us",
      markets: "spread,moneyline,totals",
      oddsFormat: "american",
    });

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.statusText}`);
    }

    const data: OddsAPIGame[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${sport} odds:`, error);
    return [];
  }
}

/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return 1 + odds / 100;
  }
  return 1 + 100 / Math.abs(odds);
}

/**
 * Convert decimal odds to implied probability
 */
export function oddsToImpliedProb(decimalOdds: number): number {
  return (1 / decimalOdds) * 100;
}

/**
 * Normalize raw Odds API data into our market format
 */
export function normalizeMarkets(games: OddsAPIGame[], sport: Sport): NormalizedMarket[] {
  const normalized: NormalizedMarket[] = [];

  games.forEach((game) => {
    game.bookmakers.forEach((bookmaker) => {
      bookmaker.markets.forEach((market) => {
        if (market.key === "spread") {
          market.outcomes.forEach((outcome) => {
            const decimalOdds = americanToDecimal(outcome.price);
            const impliedProb = oddsToImpliedProb(decimalOdds);

            normalized.push({
              id: `${game.id}-${bookmaker.key}-spread-${outcome.name}`,
              sport,
              matchup: `${game.home_team} vs ${game.away_team}`,
              market: "spread",
              line: outcome.name,
              price: outcome.price,
              book: bookmaker.title,
              probability: impliedProb,
              timestamp: new Date().toISOString(),
              confidence: 72 + Math.random() * 15,
              risk: impliedProb > 65 ? "Low" : impliedProb > 50 ? "Medium" : "High",
              homeTeam: game.home_team,
              awayTeam: game.away_team,
            });
          });
        } else if (market.key === "moneyline") {
          market.outcomes.forEach((outcome) => {
            const decimalOdds = americanToDecimal(outcome.price);
            const impliedProb = oddsToImpliedProb(decimalOdds);

            normalized.push({
              id: `${game.id}-${bookmaker.key}-ml-${outcome.name}`,
              sport,
              matchup: `${game.home_team} vs ${game.away_team}`,
              market: "moneyline",
              line: outcome.name,
              price: outcome.price,
              book: bookmaker.title,
              probability: impliedProb,
              timestamp: new Date().toISOString(),
              confidence: 70 + Math.random() * 12,
              risk: impliedProb > 60 ? "Low" : impliedProb > 45 ? "Medium" : "High",
              homeTeam: game.home_team,
              awayTeam: game.away_team,
            });
          });
        } else if (market.key === "totals") {
          market.outcomes.forEach((outcome) => {
            const decimalOdds = americanToDecimal(outcome.price);
            const impliedProb = oddsToImpliedProb(decimalOdds);

            normalized.push({
              id: `${game.id}-${bookmaker.key}-total-${outcome.name}`,
              sport,
              matchup: `${game.home_team} vs ${game.away_team}`,
              market: "total",
              line: outcome.name,
              price: outcome.price,
              book: bookmaker.title,
              probability: impliedProb,
              timestamp: new Date().toISOString(),
              confidence: 71 + Math.random() * 13,
              risk: impliedProb > 55 ? "Low" : impliedProb > 45 ? "Medium" : "High",
              homeTeam: game.home_team,
              awayTeam: game.away_team,
            });
          });
        }
      });
    });
  });

  return normalized;
}

/**
 * Mock data for testing (0 credits used)
 */
function getMockOdds(): OddsAPIGame[] {
  return [
    {
      id: "nfl_1",
      sport_key: "americanfootball_nfl",
      sport_title: "NFL",
      commence_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      home_team: "Kansas City Chiefs",
      away_team: "Buffalo Bills",
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "spread",
              last_update: new Date().toISOString(),
              outcomes: [
                { name: "KC -2.5", price: -110 },
                { name: "BUF +2.5", price: -110 },
              ],
            },
            {
              key: "moneyline",
              last_update: new Date().toISOString(),
              outcomes: [
                { name: "Kansas City Chiefs", price: -135 },
                { name: "Buffalo Bills", price: 110 },
              ],
            },
            {
              key: "totals",
              last_update: new Date().toISOString(),
              outcomes: [
                { name: "Over 47.5", price: -110 },
                { name: "Under 47.5", price: -110 },
              ],
            },
          ],
        },
        {
          key: "fanduel",
          title: "FanDuel",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "spread",
              last_update: new Date().toISOString(),
              outcomes: [
                { name: "KC -2.5", price: -110 },
                { name: "BUF +2.5", price: -110 },
              ],
            },
            {
              key: "moneyline",
              last_update: new Date().toISOString(),
              outcomes: [
                { name: "Kansas City Chiefs", price: -130 },
                { name: "Buffalo Bills", price: 105 },
              ],
            },
          ],
        },
      ],
    },
  ];
}
