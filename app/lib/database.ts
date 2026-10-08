/**
 * Database schema and utilities for storing market history
 */

export interface MarketSnapshot {
  id: string;
  timestamp: string;
  sport: string;
  matchup: string;
  market: string;
  line: string;
  price: number;
  book: string;
  probability: number;
  confidence: number;
}

export interface UserPick {
  id: string;
  createdAt: string;
  market: MarketSnapshot;
  odds: number;
  confidence: number;
  result?: "win" | "loss" | "pending";
  resolvedAt?: string;
}

export interface DailySnapshot {
  date: string;
  timestamp: string;
  totalMarkets: number;
  totalBooks: number;
  sports: string[];
  topPicks: MarketSnapshot[];
}

/**
 * Mock database for development
 * In production, use Supabase, PostgreSQL, or SQLite
 */
let snapshots: DailySnapshot[] = [];
let userPicks: UserPick[] = [];

export function saveSnapshot(snapshot: DailySnapshot): void {
  snapshots.push(snapshot);
  // In production: await db.dailySnapshots.insert(snapshot);
}

export function getLatestSnapshot(): DailySnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function saveUserPick(pick: UserPick): void {
  userPicks.push(pick);
  // In production: await db.userPicks.insert(pick);
}

export function getUserPickHistory(): UserPick[] {
  return userPicks;
}

export function calculateUserStats() {
  const total = userPicks.length;
  const wins = userPicks.filter((p) => p.result === "win").length;
  const losses = userPicks.filter((p) => p.result === "loss").length;
  const pending = userPicks.filter((p) => p.result === "pending").length;

  return {
    total,
    wins,
    losses,
    pending,
    winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0",
    roi: ((wins - losses) / total * 100).toFixed(1),
  };
}
