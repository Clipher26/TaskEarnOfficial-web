"use client";

import React from "react";
import { VirtualWallet } from "../lib/api";
import { triggerHaptic } from "../lib/telegram";

interface WalletHeaderProps {
  wallet: VirtualWallet | null;
  onOpenDeposit: () => void;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ wallet, onOpenDeposit }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            VIP Tier {wallet?.vip_tier || 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
            🔥 {wallet?.streak_count || 0} Day Streak
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Credits: <span className="text-slate-200 font-bold">{wallet?.platform_credits || 0}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Available Balance</p>
        <h2 className="text-3xl font-extrabold text-white mt-1">
          ${wallet ? Number(wallet.available_balance_usdt).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
          <span className="text-sm font-normal text-slate-400 ml-1.5">USDT</span>
        </h2>
        {wallet && Number(wallet.locked_margin_usdt) > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            🔒 In Margin: ${Number(wallet.locked_margin_usdt).toFixed(2)} USDT
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            triggerHaptic("light");
            onOpenDeposit();
          }}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
        >
          <span>⚡ Deposit Web3</span>
        </button>
        <button
          onClick={() => triggerHaptic("light")}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5"
        >
          <span>💸 Withdraw</span>
        </button>
      </div>
    </div>
  );
};
