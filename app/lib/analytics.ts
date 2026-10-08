import { NormalizedMarket } from "./oddsApi";

/**
 * Calculate expected value for a given bet
 */
export function calculateEV(odds: number, winProb: number, stake: number = 100): number {
  const decimalOdds = odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
  const payout = stake * decimalOdds;
  const probability = winProb / 100;
  return probability * payout - stake;
}

/**
 * Calculate implied probability from American odds
 */
export function impliedProbFromOdds(odds: number): number {
  if (odds > 0) {
    return (100 / (odds + 100)) * 100;
  }
  return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100;
}

/**
 * Calculate edge: difference between actual win prob and implied prob
 */
export function calculateEdge(actualProb: number, impliedProb: number): number {
  return actualProb - impliedProb;
}

/**
 * Score a market for best value (0-100)
 */
export function scoreMarket(market: NormalizedMarket): number {
  const impliedProb = impliedProbFromOdds(market.price);
  const edge = calculateEdge(market.probability, impliedProb);
  const ev = calculateEV(market.price, market.probability, 100);

  // Scoring factors:
  // - Positive edge (50%)
  // - High confidence (30%)
  // - Positive EV (20%)
  const edgeScore = Math.max(0, Math.min(50, edge * 2));
  const confidenceScore = (market.confidence / 100) * 30;
  const evScore = Math.max(0, Math.min(20, ev / 10));

  return Math.round(edgeScore + confidenceScore + evScore);
}

/**
 * Find best odds across all books for a given market
 */
export function findBestOdds(
  markets: NormalizedMarket[],
  matchup: string,
  marketType: string
): { best: NormalizedMarket; alternatives: NormalizedMarket[] } | null {
  const relevant = markets.filter(
    (m) => m.matchup === matchup && m.market === marketType
  );

  if (relevant.length === 0) return null;

  const scored = relevant.map((m) => ({
    ...m,
    score: scoreMarket(m),
  }));

  scored.sort((a, b) => b.score - a.score);

  return {
    best: scored[0],
    alternatives: scored.slice(1, 4),
  };
}

/**
 * Get top N picks by value score
 */
export function getTopPicks(markets: NormalizedMarket[], limit: number = 10): NormalizedMarket[] {
  return markets
    .map((m) => ({
      ...m,
      score: scoreMarket(m),
    }))
    .sort((a, b) => (b as any).score - (a as any).score)
    .slice(0, limit)
    .map(({ score, ...m }) => m);
}

/**
 * Run Monte Carlo simulation on a slip of picks
 */
export function runMonteCarloSimulation(
  picks: Array<{ odds: number; confidence: number }>,
  iterations: number = 10000
): { winRate: number; expectedValue: number; distribution: number[] } {
  let wins = 0;
  const distribution: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let slipHit = true;

    for (const pick of picks) {
      const random = Math.random() * 100;
      if (random > pick.confidence) {
        slipHit = false;
        break;
      }
    }

    if (slipHit) {
      wins++;
      distribution.push(1);
    } else {
      distribution.push(0);
    }
  }

  const winRate = (wins / iterations) * 100;
  let totalMultiplier = 1;
  for (const pick of picks) {
    const decimalOdds = pick.odds > 0 ? 1 + pick.odds / 100 : 1 + 100 / Math.abs(pick.odds);
    totalMultiplier *= decimalOdds;
  }

  const expectedValue = (winRate / 100) * (100 * totalMultiplier) - 100;

  return {
    winRate,
    expectedValue,
    distribution,
  };
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number): string {
  if (odds > 0) {
    return `+${odds}`;
  }
  return `${odds}`;
}

/**
 * Get risk level based on implied probability
 */
export function getRiskLevel(impliedProb: number): "Low" | "Medium" | "High" {
  if (impliedProb > 65) return "Low";
  if (impliedProb > 50) return "Medium";
  return "High";
}
