"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Trophy, TrendingUp, Medal, Crown, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { leaderboardApi, LeaderboardResponse } from "@/api/leaderboardApi";

const CATEGORIES = [
  { key: "referral:daily", label: "Top Earners" },
  { key: "referral:weekly", label: "Top Traders" },
  { key: "volume:weekly", label: "Top Earnpoly" },
];

export default function LeaderboardPage() {
  const { setActiveModule, user } = useAppStore();
  const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [category, setCategory] = useState("referral:weekly");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("leaderboard");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const result = await leaderboardApi.getLeaderboard(category);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    if (category) fetchLeaderboard();
  }, [category]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-amber-400" />;
    if (rank === 2) return <Medal size={20} className="text-slate-300" />;
    if (rank === 3) return <Medal size={20} className="text-orange-400" />;
    return <span className="text-sm font-bold text-slate-500">#{rank}</span>;
  };

  const entries = data?.entries || [];

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Leaderboards</h1>
          <p className="text-[10px] text-slate-400">Compete for weekly prizes</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`
                flex-1 py-2 rounded-lg text-[10px] font-medium transition-all
                ${category === c.key
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-300"
                }
              `}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Prize Pool</p>
              <p className="text-xl font-bold text-amber-400">$500.00 USDT</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Top 50</p>
              <p className="text-sm font-medium text-white">Payout Sunday 00:00 UTC</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.user_id}
                className={`
                  glass-card p-4 flex items-center gap-3
                  ${idx < 3 ? "border-amber-500/30" : ""}
                `}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  {getRankIcon(idx + 1)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {entry.handle || `User ${entry.user_id.slice(0, 6)}`}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Score: {entry.score.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">#{idx + 1}</p>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-4">No entries yet. Be the first!</p>
            )}
          </div>
        )}

        <div className="text-center py-4">
          <p className="text-xs text-slate-500">
            Prize pool: 20% of platform house fees distributed weekly
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
