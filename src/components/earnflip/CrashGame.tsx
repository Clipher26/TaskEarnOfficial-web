"use client";

import React, { useEffect, useState, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCallback } from "react";
import { Rocket, Zap, TrendingUp, AlertTriangle } from "lucide-react";

export function CrashGame() {
  const [multiplier, setMultiplier] = useState(1.00);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [bet, setBet] = useState(10);
  const [history, setHistory] = useState<number[]>([]);
  const wsUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace("http", "ws") + "/ws/v1/earnflip/crash" || "ws://localhost:8000/ws/v1/earnflip/crash";

  const handleMessage = useCallback((data: any) => {
    if (data.type === "state") {
      setMultiplier(data.multiplier);
      setRunning(data.running);
    } else if (data.type === "start") {
      setMultiplier(1.00);
      setRunning(true);
      setCrashed(false);
    } else if (data.type === "tick") {
      setMultiplier(data.multiplier);
    } else if (data.type === "crash") {
      setMultiplier(data.multiplier);
      setRunning(false);
      setCrashed(true);
      setHistory((prev) => [data.multiplier, ...prev].slice(0, 20));
    } else if (data.type === "cashout") {
      console.log("Cashout at", data.multiplier);
    }
  }, []);

  const { connected, send } = useWebSocket(wsUrl, handleMessage);

  const handleCashout = () => {
    if (running && !crashed) {
      send({ action: "cashout", user: "player-1" });
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="text-indigo-400" size={20} />
          <h3 className="text-sm font-bold text-white">Crash Arcade</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${connected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {connected ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      <div className="relative h-48 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        <div className={`text-center ${crashed ? "animate-pulse" : ""}`}>
          <p className={`text-4xl font-bold ${crashed ? "text-rose-400" : running ? "text-emerald-400" : "text-white"}`}>
            {multiplier.toFixed(2)}x
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {running ? "CASH OUT NOW" : crashed ? "CRASHED" : "WAITING FOR NEXT ROUND"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(parseFloat(e.target.value) || 0)}
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          placeholder="Bet amount"
        />
        <button
          onClick={handleCashout}
          disabled={!running || crashed}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap size={14} />
          Cash Out
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">History</p>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {history.length === 0 ? (
            <p className="text-[10px] text-slate-600">No rounds yet</p>
          ) : (
            history.map((val, idx) => (
              <span
                key={idx}
                className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                  val >= 2 ? "bg-emerald-500/10 text-emerald-400" : val >= 1.5 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {val.toFixed(2)}x
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
