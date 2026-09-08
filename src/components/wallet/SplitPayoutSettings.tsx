"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, PayoutSplit } from "@/api/fintechApi";
import { Split, Loader2, CheckCircle2 } from "lucide-react";

export const SplitPayoutSettings: React.FC = () => {
  const { payoutSplit, setPayoutSplit } = useAppStore();
  const [splits, setSplits] = useState<Record<string, number>>({
    USDT_CRYPTO: 50,
    P2P_BANK_FIAT: 50,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSplit();
  }, []);

  const fetchSplit = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getPayoutSplit();
      setPayoutSplit(data);
      if (data?.splits) {
        setSplits(data.splits);
      }
    } catch (err) {
      console.error("Failed to fetch split", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const result = await fintechApi.createPayoutSplit({ splits });
      setPayoutSplit(result);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save split");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (key: string, value: number) => {
    setSplits((prev) => ({ ...prev, [key]: value }));
  };

  const totalPercent = Object.values(splits).reduce((a, b) => a + b, 0);

  return (
    <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Split className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-white">Split-Payout Options</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300">USDT Crypto Wallet</span>
              <span className="text-xs text-emerald-400 font-bold">{splits.USDT_CRYPTO}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={splits.USDT_CRYPTO}
              onChange={(e) => handleChange("USDT_CRYPTO", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300">P2P Bank Fiat Balance</span>
              <span className="text-xs text-amber-400 font-bold">{splits.P2P_BANK_FIAT}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={splits.P2P_BANK_FIAT}
              onChange={(e) => handleChange("P2P_BANK_FIAT", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total split</span>
            <span className={totalPercent === 100 ? "text-emerald-400" : "text-rose-400"}>{totalPercent}%</span>
          </div>
          <button
            onClick={handleSave}
            disabled={submitting || totalPercent !== 100}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Split className="w-3.5 h-3.5" />
            )}
            {success ? "Saved!" : "Save Split"}
          </button>
        </div>
      )}
    </div>
  );
};
