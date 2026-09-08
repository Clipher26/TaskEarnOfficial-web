"use client";

import React, { useState } from "react";
import { Signal, executeTrade } from "../lib/api";
import { triggerHaptic } from "../lib/telegram";

interface SignalCardProps {
  signal: Signal;
  userId: string;
  onSuccess: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState("50");

  const handleQuickTrade = async () => {
    triggerHaptic("heavy");
    setLoading(true);

    try {
      await executeTrade({
        userId,
        symbol: signal.symbol,
        side: signal.direction,
        margin: parseFloat(amount),
        leverage,
        takeProfit: signal.tp1,
        stopLoss: signal.stop_loss,
      });

      alert(`✅ Order Placed: ${signal.symbol} ${signal.direction} @ ${signal.entry_price}`);
      onSuccess();
    } catch (err: any) {
      alert(`❌ Trade Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isBuy = signal.direction === "BUY";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-3 shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-lg font-bold text-white mr-2">{signal.symbol}</span>
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-md ${
              signal.direction === "BUY"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {signal.direction}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Status</span>
          <span className="text-xs font-bold text-indigo-400">{signal.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 my-3 bg-slate-950/60 p-2.5 rounded-xl text-center border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Entry</span>
          <span className="text-xs font-semibold text-slate-200">${signal.entry_price.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-500 uppercase block">TP1</span>
          <span className="text-xs font-bold text-emerald-400">${signal.tp1?.toFixed(2) || "—"}</span>
        </div>
        <div>
          <span className="text-[10px] text-rose-500 uppercase block">Stop Loss</span>
          <span className="text-xs font-bold text-rose-400">${signal.stop_loss?.toFixed(2) || "—"}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 block mb-1">Margin (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] text-slate-400 block mb-1">Leverage</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={5}>5x</option>
            <option value={10}>10x</option>
            <option value={20}>20x</option>
            <option value={50}>50x</option>
          </select>
        </div>
      </div>

      <button
        disabled={loading}
        onClick={handleQuickTrade}
        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 ${
          isBuy
            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
            : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Executing Order..." : `Copy Signal (${signal.direction} ${signal.symbol})`}
      </button>
    </div>
  );
};
