"use client";

import React from "react";
import { Wallet, Copy, UserPlus, Crown } from "lucide-react";

interface BalanceCardProps {
  usdtBalance: number;
  tcoinBalance: number;
  onAddFunds?: () => void;
  onInviteFriends?: () => void;
  onActivateVip?: () => void;
}

const TCOIN_TO_USDT = 0.03;

export const BalanceCard: React.FC<BalanceCardProps> = ({
  usdtBalance,
  tcoinBalance,
  onAddFunds,
  onInviteFriends,
  onActivateVip,
}) => {
  const tcoinUsdtValue = tcoinBalance * TCOIN_TO_USDT;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-5 shadow-2xl shadow-emerald-900/30 border border-emerald-400/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/10 rounded-full -ml-8 -mb-8 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              Total Balance
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-white/70 bg-white/10 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Live
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {usdtBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-sm font-semibold text-white/80 ml-1.5">USDT</span>
          </h2>
          <p className="text-xs text-white/70 mt-1 font-medium">
            ≈ {tcoinUsdtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT in Tcoin
          </p>
        </div>

        <div className="flex items-center gap-2 mb-5 p-2.5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-300 font-bold text-xs">TC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Tcoin Balance</p>
            <p className="text-sm font-bold text-white truncate">
              {tcoinBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })} Tcoin
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50">Rate</p>
            <p className="text-xs font-semibold text-white/80">1 TC = $0.03</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onAddFunds}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-white text-emerald-700 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <Wallet size={14} />
            Add Funds
          </button>
          <button
            onClick={onInviteFriends}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-sm"
          >
            <UserPlus size={14} />
            Invite
          </button>
          <button
            onClick={onActivateVip}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-500/20 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 hover:bg-amber-500/30 active:scale-95 transition-all"
          >
            <Crown size={14} />
            VIP
          </button>
        </div>
      </div>
    </div>
  );
};
