"use client";

import React, { useState, useEffect } from "react";
import { predictionApi, PredictionMarket, OutcomeType, AMMSwapRequest } from "@/api/predictionApi";
import { TrendingUp, BarChart3, Wallet } from "lucide-react";

export function OrderbookAMM() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [outcome, setOutcome] = useState<OutcomeType>("YES");
  const [amount, setAmount] = useState(10);
  const [swapResult, setSwapResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await predictionApi.listMarkets();
        setMarkets(data);
        if (data.length > 0) setSelectedMarket(data[0]);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  const yesPrice = selectedMarket
    ? selectedMarket.yes_liquidity / (selectedMarket.yes_liquidity + selectedMarket.no_liquidity || 1)
    : 0.5;
  const noPrice = selectedMarket ? 1 - yesPrice : 0.5;
  const currentPrice = outcome === "YES" ? yesPrice : noPrice;
  const potentialPayout = amount / currentPrice;

  const handleSwap = async () => {
    if (!selectedMarket || amount <= 0) return;
    try {
      const payload: AMMSwapRequest = {
        market_id: selectedMarket.id,
        outcome,
        amount,
      };
      const res = await predictionApi.swap(payload);
      setSwapResult(res);
      setMarkets((prev) =>
        prev.map((m) =>
          m.id === selectedMarket.id
            ? {
                ...m,
                yes_liquidity: res.new_yes_liquidity,
                no_liquidity: res.new_no_liquidity,
                total_volume: m.total_volume + amount,
              }
            : m
        )
      );
      if (selectedMarket) {
        setSelectedMarket({
          ...selectedMarket,
          yes_liquidity: res.new_yes_liquidity,
          no_liquidity: res.new_no_liquidity,
          total_volume: selectedMarket.total_volume + amount,
        });
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="text-indigo-400" size={20} />
        <h3 className="text-sm font-bold text-white">Prediction Syndicate</h3>
      </div>

      <div>
        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Market</label>
        <select
          value={selectedMarket?.id || ""}
          onChange={(e) => {
            const market = markets.find((m) => m.id === e.target.value);
            setSelectedMarket(market || null);
            setSwapResult(null);
          }}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {markets.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {selectedMarket && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 mb-1">YES Price</p>
              <p className="text-lg font-bold text-emerald-400">{(yesPrice * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 mb-1">NO Price</p>
              <p className="text-lg font-bold text-rose-400">{(noPrice * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOutcome("YES")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                outcome === "YES"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setOutcome("NO")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                outcome === "NO"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              NO
            </button>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Amount (TCoin)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(parseFloat(e.target.value) || 0); setSwapResult(null); }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Price: {(currentPrice * 100).toFixed(1)}%</span>
            <span>Potential Payout: {potentialPayout.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSwap}
            disabled={amount <= 0}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <TrendingUp size={14} />
            Swap Shares
          </button>

          {swapResult && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={14} className="text-emerald-400" />
                <p className="text-xs font-bold text-white">Swap Successful</p>
              </div>
              <p className="text-[10px] text-slate-400">
                Shares: {swapResult.shares.toFixed(4)} | Price: {swapResult.price.toFixed(4)} | TX: {swapResult.tx_id.slice(0, 8)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
