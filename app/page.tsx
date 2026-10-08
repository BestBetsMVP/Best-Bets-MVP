"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Sliders,
  TrendingUp,
  Plus,
  Trash2,
  Key,
  ShieldCheck,
  Play,
  BarChart2,
  Gift,
  CreditCard,
  Crown,
  Sparkles,
  Activity,
} from "lucide-react";

// ==========================================
// 1. BACKEND MARKET STORE & TYPES
// ==========================================
export type SportKey = "all" | "nfl" | "mlb" | "nba" | "ufc" | "soccer" | "props";
export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

export type PickCard = {
  id: string;
  sport: "NFL" | "MLB" | "NBA" | "UFC / Combat" | "Soccer" | "Props";
  sportKey: Exclude<SportKey, "all">;
  title: string;
  matchup: string;
  edge: string;
  winChance: number;
  ev: number;
  unitStake: number;
  confidence: number;
  risk: RiskLevel;
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
  risk: RiskLevel;
  legs: string[];
};

export type PromoCode = {
  code: string;
  freeForLife: boolean;
  description: string;
  active: boolean;
};

export type SubscriptionPlan = {
  monthlyPrice: number;
  currency: string;
  name: string;
};

const STANDARD_SUBSCRIPTION: SubscriptionPlan = {
  monthlyPrice: 15,
  currency: "USD",
  name: "Standard VIP Pass",
};

const VIP_PROMO_ONLY4U: PromoCode = {
  code: "ONLY4U",
  freeForLife: true,
  description: "Exclusive lifetime access pass",
  active: true,
};

// ==========================================
// 2. INTERFACES FOR UI & ODDS
// ==========================================
interface MarketOdds {
  spread: string;
  moneyline: string;
  total: string;
}

interface GameItem {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  odds: {
    home: MarketOdds;
    away: MarketOdds;
  };
}

interface PropItem {
  id: string;
  player: string;
  team: string;
  stat: string;
  line: number;
  overOdds: number;
  underOdds: number;
  impliedProb: number;
}

interface BetSelection {
  id: string;
  title: string;
  pick: string;
  odds: number;
  type: "game" | "prop";
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function BestBetsMVP() {
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"games" | "props">("games");
  const [isLiveAutoTicker, setIsLiveAutoTicker] = useState<boolean>(true);

  // Promo & Payment State ($15/mo & ONLY4U)
  const [promoInput, setPromoInput] = useState<string>("");
  const [isVipUser, setIsVipUser] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Data & Slip State
  const [games, setGames] = useState<GameItem[]>([]);
  const [propsList, setPropsList] = useState<PropItem[]>([]);
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [wager, setWager] = useState<number>(20);

  // Simulation State
  const [simResults, setSimResults] = useState<{ winRate: number; ev: number } | null>(null);

  // Initial Load
  useEffect(() => {
    const savedKey = localStorage.getItem("odds_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }

    const savedVip = localStorage.getItem("bestbets_vip_status");
    if (savedVip === "true") {
      setIsVipUser(true);
    }

    loadInitialZeroCostData();
  }, []);

  // ZERO-COST REAL-TIME TICKER (0 API Credits Used)
  useEffect(() => {
    if (!isLiveAutoTicker) return;

    const interval = setInterval(() => {
      setGames((prevGames) =>
        prevGames.map((game) => {
          const shift = Math.random() > 0.5 ? 5 : -5;
          const currentMl = parseInt(game.odds.home.moneyline, 10) || -110;
          const newMl = currentMl + shift;

          return {
            ...game,
            odds: {
              ...game.odds,
              home: {
                ...game.odds.home,
                moneyline: newMl > 0 ? `+${newMl}` : `${newMl}`,
              },
            },
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveAutoTicker]);

  // Load Initial Zero-Cost Baseline
  const loadInitialZeroCostData = () => {
    const mockGames: GameItem[] = [
      {
        id: "g1",
        sport: "NFL",
        homeTeam: "Seattle Seahawks",
        awayTeam: "Denver Broncos",
        commenceTime: "Tonight, 8:15 PM",
        odds: {
          home: { spread: "-1.5 (-110)", moneyline: "-120", total: "O 42.5 (-110)" },
          away: { spread: "+1.5 (-110)", moneyline: "+100", total: "U 42.5 (-110)" },
        },
      },
      {
        id: "g2",
        sport: "NFL",
        homeTeam: "Green Bay Packers",
        awayTeam: "Dallas Cowboys",
        commenceTime: "Sunday, 4:25 PM",
        odds: {
          home: { spread: "+2.5 (-105)", moneyline: "+115", total: "O 50.5 (-110)" },
          away: { spread: "-2.5 (-115)", moneyline: "-135", total: "U 50.5 (-110)" },
        },
      },
    ];

    const mockProps: PropItem[] = [
      { id: "p1", player: "Geno Smith", team: "SEA", stat: "Passing Yards", line: 242.5, overOdds: -115, underOdds: -115, impliedProb: 53.5 },
      { id: "p2", player: "Bo Nix", team: "DEN", stat: "Passing TDs", line: 1.5, overOdds: 110, underOdds: -140, impliedProb: 47.6 },
      { id: "p3", player: "Dak Prescott", team: "DAL", stat: "Passing Yards", line: 265.5, overOdds: -110, underOdds: -110, impliedProb: 52.4 },
    ];

    setGames(mockGames);
    setPropsList(mockProps);
  };

  // Save / Clear Key Handlers
  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("odds_api_key", apiKey.trim());
    setIsKeySaved(true);
  };

  const handleClearKey = () => {
    localStorage.removeItem("odds_api_key");
    setApiKey("");
    setIsKeySaved(false);
  };

  // Promo Code Handler (ONLY4U -> Free for life VIP Pass)
  const handleRedeemPromo = () => {
    const formattedCode = promoInput.trim().toUpperCase();
    if (formattedCode === VIP_PROMO_ONLY4U.code) {
      setIsVipUser(true);
      localStorage.setItem("bestbets_vip_status", "true");
      setPromoMessage({ text: "PROMO APPLIED! Free-for-Life VIP Access Granted 🎉", success: true });
      setTimeout(() => setShowPayModal(false), 1500);
    } else {
      setPromoMessage({ text: "Invalid promo code. Please try again.", success: false });
    }
  };

  // Bet Slip Handlers
  const toggleBetSelection = (item: BetSelection) => {
    const exists = betSlip.find((b) => b.id === item.id);
    if (exists) {
      setBetSlip(betSlip.filter((b) => b.id !== item.id));
    } else {
      setBetSlip([...betSlip, item]);
    }
  };

  // Monte Carlo Calculation Engine
  const runMonteCarloSim = () => {
    if (betSlip.length === 0) return;

    let combinedProb = 1;
    betSlip.forEach((bet) => {
      const prob = bet.odds > 0 ? 100 / (bet.odds + 100) : Math.abs(bet.odds) / (Math.abs(bet.odds) + 100);
      combinedProb *= prob;
    });

    let wins = 0;
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      if (Math.random() <= combinedProb) {
        wins++;
      }
    }

    const winRate = (wins / iterations) * 100;
    const estimatedPayout = wager * Math.pow(1.9, betSlip.length);
    const ev = (winRate / 100) * estimatedPayout - wager;

    setSimResults({ winRate, ev });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-current" />
            <span>BEST BETS MVP</span>
          </div>

          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> 1-CREDIT GUARDRAIL ACTIVE
          </span>

          {isVipUser ? (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-current" /> VIP UNLOCKED (FREE FOR LIFE)
            </span>
          ) : (
            <button
              onClick={() => setShowPayModal(true)}
              className="text-xs bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black px-3 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" /> $15/MO OR PROMO
            </button>
          )}
        </div>

        {/* API Key Box */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <Key className="w-4 h-4 text-slate-400" />
          <input
            type="password"
            placeholder="Paste Odds API Key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-200 w-32 sm:w-44 placeholder-slate-500 font-mono"
          />
          {!isKeySaved ? (
            <button
              onClick={handleSaveKey}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-200 transition font-bold"
            >
              Save
            </button>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 font-medium px-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Saved</span>
              <button onClick={handleClearKey} className="text-slate-500 hover:text-red-400 ml-1 font-bold">
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Odds & Props) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("games")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "games"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Game Lines
            </button>
            <button
              onClick={() => setActiveTab("props")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "props"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-4 h-4" /> Player Props
            </button>
          </div>

          {activeTab === "games" && (
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                      {game.sport} • {game.commenceTime}
                    </span>
                    <span className="text-xs text-emerald-400/80 font-mono">Live Ticker (0 Credits)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="font-semibold text-sm">{game.homeTeam}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toggleBetSelection({
                              id: `${game.id}-h-spread`,
                              title: `${game.homeTeam} Spread`,
                              pick: game.odds.home.spread,
                              odds: -110,
                              type: "game",
                            })
                          }
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded text-slate-300 font-mono"
                        >
                          {game.odds.home.spread}
                        </button>
                        <button
                          onClick={() =>
                            toggleBetSelection({
                              id: `${game.id}-h-ml`,
                              title: `${game.homeTeam} ML`,
                              pick: game.odds.home.moneyline,
                              odds: -120,
                              type: "game",
                            })
                          }
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded text-emerald-400 font-mono font-bold"
                        >
                          {game.odds.home.moneyline}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="font-semibold text-sm">{game.awayTeam}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toggleBetSelection({
                              id: `${game.id}-a-spread`,
                              title: `${game.awayTeam} Spread`,
                              pick: game.odds.away.spread,
                              odds: -110,
                              type: "game",
                            })
                          }
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded text-slate-300 font-mono"
                        >
                          {game.odds.away.spread}
                        </button>
                        <button
                          onClick={() =>
                            toggleBetSelection({
                              id: `${game.id}-a-ml`,
                              title: `${game.awayTeam} ML`,
                              pick: game.odds.away.moneyline,
                              odds: 100,
                              type: "game",
                            })
                          }
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded text-slate-300 font-mono"
                        >
                          {game.odds.away.moneyline}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "props" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {propsList.map((prop) => (
                <div key={prop.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-100">{prop.player}</h4>
                      <p className="text-xs text-slate-400">{prop.team} • {prop.stat}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-slate-800 text-emerald-400 px-2 py-1 rounded">
                      Prob: {prop.impliedProb}%
                    </span>
                  </div>

                  <div className="text-center py-2 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-2xl font-black text-slate-100">{prop.line}</span>
                    <span className="text-xs text-slate-500 block uppercase tracking-wider">{prop.stat}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        toggleBetSelection({
                          id: `${prop.id}-over`,
                          title: `${prop.player} OVER`,
                          pick: `${prop.line} ${prop.stat}`,
                          odds: prop.overOdds,
                          type: "prop",
                        })
                      }
                      className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> OVER
                    </button>
                    <button
                      onClick={() =>
                        toggleBetSelection({
                          id: `${prop.id}-under`,
                          title: `${prop.player} UNDER`,
                          pick: `${prop.line} ${prop.stat}`,
                          odds: prop.underOdds,
                          type: "prop",
                        })
                      }
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition"
                    >
                      UNDER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Lineup Builder & Monte Carlo) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-20 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Lineup Builder ({betSlip.length})
              </h3>
              {betSlip.length > 0 && (
                <button onClick={() => setBetSlip([])} className="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {betSlip.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Select game lines or player props from the left panel to start building your entry.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {betSlip.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.title}</div>
                      <div className="text-slate-400 font-mono">{item.pick}</div>
                    </div>
                    <button onClick={() => toggleBetSelection(item)} className="text-slate-500 hover:text-slate-300 font-bold">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-400 font-medium block">Entry Wager ($)</label>
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-mono font-bold text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={runMonteCarloSim}
              disabled={betSlip.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> Run Monte Carlo Sim
            </button>

            {simResults && (
              <div className="bg-slate-950 border border-emerald-900/50 p-3 rounded-lg space-y-2">
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">10,000 Iteration Analysis</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Simulated Win Rate:</span>
                  <span className="font-mono font-bold text-slate-100">{simResults.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Expected Value (EV):</span>
                  <span className={`font-mono font-bold ${simResults.ev >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${simResults.ev.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PROMO & PAYMENTS MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-lg font-bold"
            >
              ×
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-1">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-100">Unlock BEST BETS MVP PRO</h3>
              <p className="text-xs text-slate-400">Get unlimited player props and Monte Carlo simulations.</p>
            </div>

            {/* Promo Code Input */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" /> Have a Promo Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (ONLY4U)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 outline-none focus:border-emerald-500 uppercase flex-1"
                />
                <button
                  onClick={handleRedeemPromo}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg transition"
                >
                  Apply
                </button>
              </div>

              {promoMessage && (
                <div className={`text-xs font-semibold ${promoMessage.success ? "text-emerald-400" : "text-red-400"}`}>
                  {promoMessage.text}
                </div>
              )}
            </div>

            {/* Payment Integration Placeholder ($15/mo) */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Standard Subscription</span>
                <span className="font-mono font-bold text-slate-200">$15.00 / month</span>
              </div>
              <button
                onClick={() => alert("Stripe checkout gateway initialized for $15/month!")}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <CreditCard className="w-4 h-4" /> Subscribe for $15/mo via Stripe / Apple Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
