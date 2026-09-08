"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { SignalCard } from "@/components/SignalCard";
import { Radio, Filter, TrendingUp, TrendingDown, Star } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { signalApi, TradingSignal } from "@/api/signalApi";

const VIP_SIGNAL_LIMITS: Record<string, number> = {
  FREE: 3,
  BRONZE: 10,
  SILVER: 25,
  GOLD: 50,
  PLATINUM: 100,
  DIAMOND: 999,
  ELITE_TRADER: 999,
};

export default function SignalsPage() {
  const { signals, setActiveModule, setSignals, user } = useAppStore();
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [loading, setLoading] = useState(true);
  const [signalLimit, setSignalLimit] = useState(20);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("signals");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const fetchSignals = async () => {
      setLoading(true);
      try {
        const vipTier = user?.vip_tier || "BRONZE";
        const limit = VIP_SIGNAL_LIMITS[vipTier] || 5;
        setSignalLimit(limit);

        const data = await signalApi.getMySignals(user.id, limit);
        setSignals(data as any);
      } catch (error) {
        console.error("Failed to fetch signals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [isLoggedIn, user?.id, setSignals]);

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredSignals = signals.filter((s) => {
    if (filter === "ALL") return true;
    return s.direction === filter;
  });

  const buySignals = signals.filter((s) => s.direction === "BUY").length;
  const sellSignals = signals.filter((s) => s.direction === "SELL").length;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-white">Signals Radar</h1>
              <p className="text-[10px] text-slate-400">Quantitative AI Trading Signals</p>
            </div>
            <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
              <Radio size={12} className="text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400">{signals.length}/{signalLimit}</span>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <Star size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{user?.vip_tier || "BRONZE"}</span>
            </div>
          </div>

          <div className="flex gap-1">
            {(["ALL", "BUY", "SELL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all
                  ${filter === f
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-300"
                  }
                `}
              >
                {f === "ALL" ? `All (${signals.length})` : f === "BUY" ? `Buy (${buySignals})` : `Sell (${sellSignals})`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-12">
            <Radio size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No signals match your filter.</p>
            <p className="text-xs text-slate-500 mt-1">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                userId={useAppStore.getState().wallet?.user_id || ""}
                onSuccess={() => window.location.reload()}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
