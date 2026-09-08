"use client";

import React, { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
  onCopy?: (code: string) => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ referralCode, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://taskearnofficial.online/register?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      onCopy?.(referralCode);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-500/10 to-emerald-600/20 border border-emerald-500/20 p-4 shadow-lg">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <Share2 size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Share & Earn</h3>
        </div>

        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          Get rewards for every successful referral
          <span className="text-emerald-400 font-semibold"> (7% T1 / 3% T2)</span>
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Your Link</p>
            <p className="text-xs text-slate-200 font-mono truncate">{referralLink}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`
              flex items-center justify-center w-10 h-10 rounded-xl border
              active:scale-90 transition-all duration-200 flex-shrink-0
              ${
                copied
                  ? "bg-emerald-500 border-emerald-400 text-black"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
              }
            `}
            aria-label="Copy referral link"
          >
            {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
