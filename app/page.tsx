"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { buildBestValueBoard, getRefreshSchedule } from "@/app/lib/marketData";

type BuilderSelection = {
  id: string;
  label: string;
  odds: string;
  tag: string;
};

const formatPercent = (v: number) => `${v.toFixed(1)}%`;

export default function BestBetsBoardPage() {
  const [selectedSport, setSelectedSport] = useState("All");
  const [builder, setBuilder] = useState<BuilderSelection[]>([]);
  const [nowLabel, setNowLabel] = useState("06:00 AM ET");

  const refreshInfo = useMemo(() => getRefreshSchedule(), []);
  const marketBoard = useMemo(() => buildBestValueBoard(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setNowLabel(`${time} ET`);
    }, 1000 * 30);

    return () => clearInterval(timer);
  }, []);

  const filteredBoard =
    selectedSport === "All"
      ? marketBoard
      : marketBoard.filter((item) => item.sport === selectedSport);

  const addToBuilder = (entry: (typeof marketBoard)[number]) => {
    const duplicate = builder.some((item) => item.id === entry.id);
    if (duplicate) return;
    setBuilder((prev) => [
      ...prev,
      {
        id: entry.id,
        label: `${entry.matchup} • ${entry.market.toUpperCase()}`,
        odds: `${entry.line} (${entry.price})`,
        tag: `${entry.book}`,
      },
    ]);
  };

  const removeFromBuilder = (id: string) => {
    setBuilder((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5 fill-current" />
              <span className="tracking-tight">BEST BETS MVP</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              Daily refresh: {nowLabel}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Authorized data only • no scraping</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Live sources" value="3 approved feeds" tone="emerald" icon={<Sparkles className="h-4 w-4" />} />
          <StatCard label="Refresh window" value={refreshInfo.cron} tone="blue" icon={<Clock3 className="h-4 w-4" />} />
          <StatCard label="Best edge" value={formatPercent(Math.max(...marketBoard.map((m) => m.edge)))} tone="amber" icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Confidence floor" value="70%+" tone="violet" icon={<Target className="h-4 w-4" />} />
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Best value board</p>
                <h1 className="mt-1 text-2xl font-black text-white">Prediction chart</h1>
              </div>

              <div className="flex flex-wrap gap-2">
                {['All', 'NFL', 'NBA', 'Soccer', 'MLB'].map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      selectedSport === sport
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredBoard.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                          {item.sport}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          {item.market}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg font-black text-white">{item.matchup}</h2>
                        {item.player && (
                          <p className="text-sm text-slate-400">
                            {item.player} • {item.stat}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Pill label="book" value={item.book} />
                      <Pill label="line" value={item.line} />
                      <Pill label="prob" value={formatPercent(item.probability)} />
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <MetricBox label="Edge" value={`${item.edge}%`} tone="emerald" />
                    <MetricBox label="EV / $100" value={`$${item.ev}`} tone="amber" />
                    <MetricBox label="Confidence" value={`${item.confidence}%`} tone="blue" />
                    <MetricBox label="Risk" value={item.risk} tone="violet" />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => addToBuilder(item)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> Add to builder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Slip builder</p>
                  <h3 className="text-lg font-black text-white">Daily picks</h3>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-bold text-slate-300">
                  {builder.length} selected
                </span>
              </div>

              <div className="space-y-2">
                {builder.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center text-sm text-slate-400">
                    Add the strongest available picks from the board.
                  </div>
                ) : (
                  builder.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                      <div>
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-[11px] text-slate-400">{item.tag}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300">{item.odds}</span>
                        <button
                          onClick={() => removeFromBuilder(item.id)}
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Source model</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">Approved API path</span>
                  </div>
                  <p className="text-xs text-slate-400">Your secure legal feed, public market data, and licensed odds provider.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <span className="font-bold text-white">Daily refresh</span>
                  </div>
                  <p className="text-xs text-slate-400">{refreshInfo.description}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "emerald" | "blue" | "amber" | "violet";
  icon: React.ReactNode;
}) {
  const tones = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-300",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    violet: "border-violet-500/30 bg-violet-500/5 text-violet-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "blue" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  };

  return (
    <div className={`rounded-xl border p-2.5 ${tones[tone]}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
      <span className="text-slate-500">{label}: </span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
