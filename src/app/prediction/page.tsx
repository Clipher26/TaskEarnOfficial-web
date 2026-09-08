"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { OrderbookAMM } from "@/components/prediction/OrderbookAMM";
import { predictionApi, PredictionMarket, PredictionPosition } from "@/api/predictionApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";

export default function PredictionPage() {
  const { setActiveModule } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [positions, setPositions] = useState<PredictionPosition[]>([]);
  const [activeTab, setActiveTab] = useState<"trade" | "positions">("trade");
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("prediction");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsData, positionsData] = await Promise.all([
          predictionApi.listMarkets(),
          predictionApi.getMyPositions().catch(() => []),
        ]);
        setMarkets(marketsData);
        setPositions(positionsData);
      } catch (error) {
        console.error("Failed to fetch prediction data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Prediction Syndicate</h1>
          <p className="text-[10px] text-slate-400">P2P prediction market & AMM</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "trade"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            Trade
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "positions"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            My Positions
          </button>
        </div>

        {activeTab === "trade" && (
          <OrderbookAMM />
        )}

        {activeTab === "positions" && (
          <div className="space-y-2">
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No positions yet</p>
                <p className="text-xs text-slate-500 mt-1">Start trading to build your portfolio!</p>
              </div>
            ) : (
              positions.map((pos) => (
                <div key={pos.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} className="text-indigo-400" />
                      <p className="text-sm font-bold text-white">Market #{pos.market_id.slice(0, 8)}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      pos.outcome === "YES" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {pos.outcome}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">Shares</p>
                      <p className="text-xs font-bold text-white">{pos.shares.toFixed(4)}</p>
                    </div>
                    <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">Avg Price</p>
                      <p className="text-xs font-bold text-white">{(pos.avg_price * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">P&L</p>
                      <p className={`text-xs font-bold ${pos.realized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {pos.realized_pnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
