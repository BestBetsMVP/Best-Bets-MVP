"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import {
  calculateEV,
  calculateEdge,
  findBestOdds,
  formatOdds,
  getRiskLevel,
  getTopPicks,
  impliedProbFromOdds,
  runMonteCarloSimulation,
  scoreMarket,
} from "@/app/lib/analytics";
import { calculateUserStats, getUserPickHistory, saveUserPick } from "@/app/lib/database";
import { getMockOdds, normalizeMarkets } from "@/app/lib/oddsApi";

type BookerSelection = { id: string; label: string; odds: string; book: string };

export default function DashboardPage() {
  const [selectedSport, setSelectedSport] = useState("nfl");
  const [slip, setSlip] = useState<BookerSelection[]>([]);
  const [simResults, setSimResults] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  const markets = useMemo(() => {
    const games = getMockOdds();
    return normalizeMarkets(games, selectedSport as any);
  }, [selectedSport]);

  const topPicks = useMemo(() => getTopPicks(markets, 8), [markets]);

  useEffect(() => {
    setUserStats(calculateUserStats());
  }, []);

  const addToSlip = (market: any) => {
    if (slip.some((s) => s.id === market.id)) return;
    setSlip([
      ...slip,
      {
        id: market.id,
        label: `${market.matchup} • ${market.market.toUpperCase()}`,
        odds: formatOdds(market.price),
        book: market.book,
      },
    ]);
  };

  const removeFromSlip = (id: string) => {
    setSlip(slip.filter((s) => s.id !== id));
  };

  const runSimulation = () => {
    if (slip.length === 0) return;

    const picks = slip.map((s) => {
      const market = markets.find((m) => m.id === s.id);
      return {
        odds: market?.price || -110,
        confidence: market?.confidence || 70,
      };
    });

    const results = runMonteCarloSimulation(picks, 10000);
    setSimResults(results);
  };

  const totalMultiplier = slip.length > 0
    ? slip.reduce((acc, s) => {
        const odds = parseInt(s.odds.replace(/[^0-9]/g, "")) || 110;
        const decimalOdds = odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
        return acc * decimalOdds;
      }, 1)
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 font-black text-slate-950 shadow-lg shadow-emerald-500/30">
              <Zap className="h-5 w-5 fill-current" />
              <span>BEST BETS MVP</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Activity className="h-3 w-3 animate-pulse" />
              Next refresh: 6:00 AM ET
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Authorized data • No scraping
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* STATS ROW */}
        {userStats && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label="Total Picks"
              value={userStats.total.toString()}
              tone="blue"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Win Rate"
              value={`${userStats.winRate}%`}
              tone="emerald"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="ROI"
              value={`${userStats.roi}%`}
              tone={parseFloat(userStats.roi) >= 0 ? "amber" : "rose"}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending"
              value={userStats.pending.toString()}
              tone="violet"
            />
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT: PICKS BOARD */}
          <div className="lg:col-span-2 space-y-6">
            {/* SPORT FILTER */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white">Best Value Picks</h2>
                  <p className="text-xs text-slate-400">Top predictions ranked by edge & confidence</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["nfl", "nba", "mlb", "soccer", "nhl"].map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition ${
                        selectedSport === sport
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PICKS GRID */}
            <div className="space-y-3">
              {topPicks.map((pick) => {
                const impliedProb = impliedProbFromOdds(pick.price);
                const edge = calculateEdge(pick.probability, impliedProb);
                const ev = calculateEV(pick.price, pick.probability, 100);
                const score = scoreMarket(pick);
                const risk = getRiskLevel(impliedProb);

                return (
                  <div
                    key={pick.id}
                    className="group rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-4 transition hover:border-slate-700/50 hover:bg-slate-900/60 backdrop-blur"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">
                            {pick.sport}
                          </span>
                          <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] uppercase text-slate-400">
                            {pick.market}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                              risk === "Low"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : risk === "Medium"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                            }`}
                          >
                            {risk} Risk
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white">{pick.matchup}</h3>
                        {pick.player && (
                          <p className="text-sm text-slate-400">
                            {pick.player} • {pick.stat}
                          </p>
                        )}
                        <p className="text-sm font-mono text-slate-300">{pick.line}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <MetricBox label="Book" value={pick.book} />
                        <MetricBox label="Odds" value={formatOdds(pick.price)} />
                        <MetricBox label="Prob" value={`${pick.probability.toFixed(1)}%`} />
                        <MetricBox label="Score" value={`${score}/100`} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-slate-800/50 pt-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-slate-950/50 p-2.5">
                        <p className="text-[10px] uppercase text-slate-500">Edge</p>
                        <p className={`mt-1 text-lg font-black ${
                          edge > 0 ? "text-emerald-400" : "text-slate-300"
                        }`}>
                          {edge > 0 ? "+" : ""}{edge.toFixed(1)}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-950/50 p-2.5">
                        <p className="text-[10px] uppercase text-slate-500">EV/$100</p>
                        <p className={`mt-1 text-lg font-black ${
                          ev > 0 ? "text-amber-400" : "text-slate-300"
                        }`}>
                          ${ev.toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-950/50 p-2.5">
                        <p className="text-[10px] uppercase text-slate-500">Confidence</p>
                        <p className="mt-1 text-lg font-black text-blue-400">{pick.confidence.toFixed(0)}%</p>
                      </div>
                      <button
                        onClick={() => addToSlip(pick)}
                        disabled={slip.some((s) => s.id === pick.id)}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 font-bold uppercase text-slate-950 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SLIP BUILDER */}
          <aside className="space-y-6">
            {/* SLIP */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800/50 pb-3">
                <div>
                  <p className="text-xs uppercase text-slate-400">Your Slip</p>
                  <h3 className="text-lg font-black text-white">{slip.length} Picks</h3>
                </div>
                {slip.length > 0 && (
                  <button
                    onClick={() => setSlip([])}
                    className="text-xs text-slate-500 hover:text-red-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {slip.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-xs text-slate-500">
                    Add picks from the board to build your slip
                  </div>
                ) : (
                  slip.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{item.label}</p>
                        <p className="truncate text-xs text-slate-500">{item.book}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300">
                          {item.odds}
                        </span>
                        <button
                          onClick={() => removeFromSlip(item.id)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {slip.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-slate-800/50 pt-4">
                  <div className="rounded-lg bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase text-slate-500">Total Multiplier</p>
                    <p className="mt-1 text-2xl font-black text-emerald-400">{totalMultiplier.toFixed(2)}x</p>
                  </div>

                  <button
                    onClick={runSimulation}
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 font-bold uppercase text-white transition hover:from-indigo-500 hover:to-indigo-400 flex items-center justify-center gap-2 text-sm"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Simulate 10K Runs
                  </button>
                </div>
              )}
            </div>

            {/* SIMULATION RESULTS */}
            {simResults && (
              <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 p-5 backdrop-blur">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-800/50 pb-3">
                  <BarChart3 className="h-4 w-4 text-indigo-400" />
                  <h4 className="font-black text-white">Monte Carlo Analysis</h4>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase text-slate-500">Win Rate</p>
                    <p className="mt-1 text-2xl font-black text-emerald-400">{simResults.winRate.toFixed(2)}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/50 p-3">
                    <p className="text-[10px] uppercase text-slate-500">Expected Value / $100</p>
                    <p
                      className={`mt-1 text-2xl font-black ${
                        simResults.expectedValue > 0 ? "text-amber-400" : "text-rose-400"
                      }`}
                    >
                      ${simResults.expectedValue.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* INFO BOX */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-5 backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h4 className="font-black text-white">Legal & Safe</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>The Odds API • Licensed data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>1 credit/day • $0.01 cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>Personal use • Research only</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "emerald" | "amber" | "rose" | "violet";
}) {
  const tones = {
    blue: "border-blue-500/30 bg-blue-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    rose: "border-rose-500/30 bg-rose-500/5",
    violet: "border-violet-500/30 bg-violet-500/5",
  };

  return (
    <div className={`rounded-2xl border ${tones[tone]} p-4 backdrop-blur`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase text-slate-400">{label}</span>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-2.5">
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-white">{value}</p>
    </div>
  );
}
