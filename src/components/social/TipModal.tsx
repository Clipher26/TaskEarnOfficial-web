"use client";

import React, { useState } from "react";
import { X, Send, Gift } from "lucide-react";
import { socialApi } from "@/api/socialApi";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  onSuccess?: () => void;
}

export const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, recipientId, recipientName, onSuccess }) => {
  const [amount, setAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTip = async () => {
    setLoading(true);
    setError("");
    try {
      await socialApi.tipTCoin(recipientId, parseFloat(amount), message || undefined);
      onSuccess?.();
      onClose();
      setAmount("5");
      setMessage("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send tip");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Gift TCoin</h2>
              <p className="text-[10px] text-slate-400">to {recipientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Amount (TCoin)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={100}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none"
              placeholder="Great work!"
            />
          </div>
          {error && <p className="text-[10px] text-rose-400">{error}</p>}
          <button
            onClick={handleTip}
            disabled={loading || parseFloat(amount) <= 0}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={14} /> Send {amount} TCoin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
