"use client";

import React, { useState, useEffect } from "react";
import { ArrowRightLeft, Wallet, TrendingUp, History, Loader2 } from "lucide-react";
import { walletApi, WalletBalances, ConversionHistoryItem } from "@/api/walletApi";

type ConversionDirection = "USDT_TO_TCOIN" | "TCOIN_TO_USDT";

export default function ConversionPage() {
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<ConversionDirection>("USDT_TO_TCOIN");
  const [amount, setAmount] = useState("");

  const RATE = 30;
  const MIN_USDT = 1;
  const MAX_USDT = 10000;
  const MIN_TCOIN = 30;
  const MAX_TCOIN = 300000;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bal, hist] = await Promise.all([
        walletApi.getBalances(),
        walletApi.getConversionHistory(),
      ]);
      setBalances(bal);
      setHistory(hist);
    } catch (err) {
      console.error("Failed to load conversion data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    try {
      await walletApi.convertCurrency({
        amount: parseFloat(amount),
        conversion_type: direction,
      });
      setAmount("");
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Conversion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedTcoin = direction === "USDT_TO_TCOIN" ? parseFloat(amount || "0") * RATE : 0;
  const calculatedUsdt = direction === "TCOIN_TO_USDT" ? parseFloat(amount || "0") / RATE : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-5">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">TCoin Conversion</h1>
          <p className="text-xs text-slate-400 mt-1">Convert between USDT and TCoin instantly</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-slate-400">USDT Balance</span>
            </div>
            <p className="text-xl font-extrabold text-white">{balances?.usdt_balance.toFixed(2) || "0.00"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-slate-400">TCoin Balance</span>
            </div>
            <p className="text-xl font-extrabold text-white">{balances?.tcoin_balance.toFixed(0) || "0"}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDirection("USDT_TO_TCOIN")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                direction === "USDT_TO_TCOIN"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              USDT → TCoin
            </button>
            <button
              onClick={() => setDirection("TCOIN_TO_USDT")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                direction === "TCOIN_TO_USDT"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              TCoin → USDT
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {direction === "USDT_TO_TCOIN" ? "Amount (USDT)" : "Amount (TCoin)"}
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
                <span>
                  Min: {direction === "USDT_TO_TCOIN" ? MIN_USDT : MIN_TCOIN} | Max: {direction === "USDT_TO_TCOIN" ? MAX_USDT.toLocaleString() : MAX_TCOIN.toLocaleString()}
                </span>
                <span>Rate: 1 USDT = {RATE} TCoin</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">You will receive</span>
                <span className="text-sm font-bold text-white">
                  {direction === "USDT_TO_TCOIN"
                    ? `${calculatedTcoin.toFixed(0)} TCoin`
                    : `${calculatedUsdt.toFixed(2)} USDT`}
                </span>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={submitting || !amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
              {submitting ? "Converting..." : "Convert Now"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white">Conversion History</h2>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No conversions yet
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    item.conversion_type === "USDT_TO_TCOIN"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {item.conversion_type === "USDT_TO_TCOIN" ? "USDT → TCoin" : "TCoin → USDT"}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {item.usdt_amount ? `${item.usdt_amount.toFixed(2)} USDT` : `${item.tcoin_amount?.toFixed(0)} TCoin`}
                  </span>
                  <span className="text-white font-bold">
                    {item.usdt_amount ? `${item.tcoin_amount?.toFixed(0)} TCoin` : `${item.usdt_amount?.toFixed(2)} USDT`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
