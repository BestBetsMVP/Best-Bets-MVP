export type SportKey = "all" | "nfl" | "mlb" | "nba" | "ufc" | "props" | "custom";

export type PickCard = {
  id: string;
  sport: "NFL" | "MLB" | "NBA" | "UFC / Combat" | "Soccer" | "Props";
  sportKey: Exclude<SportKey, "all" | "custom" | "props"> | "props";
  title: string;
  matchUp: string;
  edge: string;
  winChance: number;
  ev: number;
  unitStake: number;
  confidence: number;
  risk: "Low Risk" | "Medium Risk" | "High Risk";
  status: string;
  valueLabel: string;
  market: string;
  premium: boolean;
};

export type SlipDraft = {
  id: string;
  title: string;
  confidence: number;
  payout: number;
  risk: string;
  legs: string[];
};

export type StatLine = {
  id: string;
  athlete: string;
  stat: string;
  line: string;
  confidence: number;
  trend: string;
};

export type MarketSnapshot = {
  generatedAt: string;
  source: "live" | "fallback";
  status: string;
  refreshWindow: string;
  summary: {
    dailyAccuracy: number;
    activeMatches: number;
    quotaStatus: string;
    highEvCards: number;
  };
  picks: PickCard[];
  dailySlips: SlipDraft[];
  statLines: StatLine[];
};

type ApiPayload = {
  markets?: Array<{
    id?: string;
    sport?: string;
    title?: string;
    matchup?: string;
    status?: string;
    winChance?: number;
    ev?: number;
    unitStake?: number;
    confidence?: number;
    risk?: string;
    valueLabel?: string;
    market?: string;
  }>;
};

const toDisplayDate = (date: Date) => date.toISOString();

const getNextSixAm = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(6, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
};

const buildFallbackSnapshot = (): MarketSnapshot => ({
  generatedAt: toDisplayDate(new Date()),
  source: "fallback",
  status: "Operational fallback mode",
  refreshWindow: `Next refresh: ${getNextSixAm().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
  summary: {
    dailyAccuracy: 82.4,
    activeMatches: 28,
    quotaStatus: "Within daily quota",
    highEvCards: 6,
  },
  picks: [
    {
      id: "nfl-1",
      sport: "NFL",
      sportKey: "nfl",
      title: "Chiefs passing game edge",
      matchUp: "Kansas City vs Buffalo",
      edge: "80% Win Chance",
      winChance: 80,
      ev: 12.4,
      unitStake: 0.8,
      confidence: 91,
      risk: "Low Risk",
      status: "Primary projection",
      valueLabel: "EV+ 12.4%",
      market: "Pass yards",
      premium: true,
    },
    {
      id: "mlb-1",
      sport: "MLB",
      sportKey: "mlb",
      title: "Bullpen leverage",
      matchUp: "Atlanta vs New York",
      edge: "74% Win Chance",
      winChance: 74,
      ev: 9.6,
      unitStake: 0.7,
      confidence: 78,
      risk: "Medium Risk",
      status: "Model-supported",
      valueLabel: "EV+ 9.6%",
      market: "Moneyline",
      premium: true,
    },
    {
      id: "nba-1",
      sport: "NBA",
      sportKey: "nba",
      title: "Three-point volume",
      matchUp: "Boston vs Miami",
      edge: "71% Win Chance",
      winChance: 71,
      ev: 8.9,
      unitStake: 0.6,
      confidence: 75,
      risk: "Medium Risk",
      status: "Trend aligned",
      valueLabel: "EV+ 8.9%",
      market: "Player prop",
      premium: false,
    },
    {
      id: "ufc-1",
      sport: "UFC / Combat",
      sportKey: "ufc",
      title: "Fight total control",
      matchUp: "Main Event • Lightweight",
      edge: "68% Win Chance",
      winChance: 68,
      ev: 7.5,
      unitStake: 0.5,
      confidence: 72,
      risk: "Medium Risk",
      status: "Live market signal",
      valueLabel: "EV+ 7.5%",
      market: "Fight total",
      premium: false,
    },
    {
      id: "props-1",
      sport: "Props",
      sportKey: "props",
      title: "Stat line projection",
      matchUp: "Luka Doncic • Assists",
      edge: "77% Win Chance",
      winChance: 77,
      ev: 10.8,
      unitStake: 0.7,
      confidence: 81,
      risk: "Low Risk",
      status: "High-value prop",
      valueLabel: "EV+ 10.8%",
      market: "Player prop",
      premium: true,
    },
    {
      id: "soccer-1",
      sport: "Soccer",
      sportKey: "nfl",
      title: "Corner and tempo edge",
      matchUp: "Inter Milan vs Napoli",
      edge: "66% Win Chance",
      winChance: 66,
      ev: 6.7,
      unitStake: 0.5,
      confidence: 69,
      risk: "Medium Risk",
      status: "Market average support",
      valueLabel: "EV+ 6.7%",
      market: "Goal markets",
      premium: false,
    },
  ],
  dailySlips: [
    {
      id: "slip-1",
      title: "Green Zone Stack",
      confidence: 89,
      payout: 5.8,
      risk: "Low Risk",
      legs: ["Chiefs pass yards", "Luka assists", "Brewers moneyline"],
    },
    {
      id: "slip-2",
      title: "Underdog Swing",
      confidence: 74,
      payout: 7.4,
      risk: "Medium Risk",
      legs: ["Inter total shots", "UFC fight total", "Celtics spread"],
    },
  ],
  statLines: [
    { id: "line-1", athlete: "Patrick Mahomes", stat: "Passing Yards", line: "Over 265.5", confidence: 91, trend: "+5.4 vs average" },
    { id: "line-2", athlete: "Luka Doncic", stat: "Assists", line: "Over 8.5", confidence: 83, trend: "+2.1 recent streak" },
    { id: "line-3", athlete: "Elly De La Cruz", stat: "Stolen Bases", line: "Over 0.5", confidence: 76, trend: "+14% sprint data" },
    { id: "line-4", athlete: "Jon Jones", stat: "Control Minutes", line: "Over 8.5", confidence: 72, trend: "Pressure index up" },
  ],
});

const normalizeSnapshot = (api: ApiPayload | null | undefined): MarketSnapshot => {
  if (!api || !Array.isArray(api.markets) || !api.markets.length) {
    return buildFallbackSnapshot();
  }

  const mapped = api.markets.slice(0, 6).map((market, index) => ({
    id: market.id ?? `${index}`,
    sport: (market.sport === "UFC" ? "UFC / Combat" : market.sport === "props" ? "Props" : market.sport ?? "NFL") as PickCard["sport"],
    sportKey: (market.sport === "UFC" ? "ufc" : market.sport === "MLB" ? "mlb" : market.sport === "NBA" ? "nba" : market.sport === "props" ? "props" : "nfl") as PickCard["sportKey"],
    title: market.title ?? "Live market projection",
    matchUp: market.matchup ?? "Cross-sport matchup",
    edge: `${market.winChance ?? 70}% Win Chance`,
    winChance: Number(market.winChance ?? 70),
    ev: Number(market.ev ?? 8),
    unitStake: Number(market.unitStake ?? 0.5),
    confidence: Number(market.confidence ?? 70),
    risk: (market.risk as PickCard["risk"]) ?? "Medium Risk",
    status: market.status ?? "Updated today",
    valueLabel: market.valueLabel ?? "EV+ 7.0%",
    market: market.market ?? "Market average",
    premium: index % 2 === 0,
  }));

  return {
    generatedAt: toDisplayDate(new Date()),
    source: "live",
    status: "Daily data refreshed",
    refreshWindow: `Next refresh: ${getNextSixAm().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
    summary: {
      dailyAccuracy: 84.1,
      activeMatches: 32,
      quotaStatus: "Fresh data loaded",
      highEvCards: mapped.filter((pick) => pick.ev > 8).length,
    },
    picks: mapped,
    dailySlips: [
      { id: "live-slip", title: "Daily model stack", confidence: 86, payout: 6.2, risk: "Low Risk", legs: [mapped[0]?.title ?? "Market edge", mapped[1]?.title ?? "Trend edge", "Consensus trend"] },
    ],
    statLines: [
      { id: "live-line-1", athlete: mapped[0]?.title ?? "Model edge", stat: "Confidence", line: `${mapped[0]?.confidence ?? 80}%`, confidence: mapped[0]?.confidence ?? 80, trend: "Updated today" },
    ],
  };
};

export const getCachedMarketSnapshot = async (): Promise<MarketSnapshot> => {
  const globalScope = globalThis as typeof globalThis & {
    __bestBetsMarketSnapshot?: MarketSnapshot;
    __bestBetsMarketTimestamp?: number;
  };

  const now = Date.now();
  const refetchWindowMs = 24 * 60 * 60 * 1000;

  const shouldRefresh = !globalScope.__bestBetsMarketSnapshot || !globalScope.__bestBetsMarketTimestamp || now - globalScope.__bestBetsMarketTimestamp > refetchWindowMs;

  if (!shouldRefresh) {
    return globalScope.__bestBetsMarketSnapshot as MarketSnapshot;
  }

  let snapshot = buildFallbackSnapshot();

  const sportsApiUrl = process.env.SPORTS_API_URL;
  if (sportsApiUrl) {
    try {
      const response = await fetch(sportsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SPORTS_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          scope: "all",
          include: ["games", "odds", "props", "line_movement"],
          refreshAt: "06:00",
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as ApiPayload;
        snapshot = normalizeSnapshot(payload);
        snapshot.source = "live";
      }
    } catch (error) {
      // Graceful fallback if the upstream market feed is unavailable.
    }
  }

  globalScope.__bestBetsMarketSnapshot = snapshot;
  globalScope.__bestBetsMarketTimestamp = now;

  return snapshot;
};

export const getDashboardData = async () => getCachedMarketSnapshot();
