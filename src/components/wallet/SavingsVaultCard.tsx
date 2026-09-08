"use client";

import React from "react";
import { SavingsVault } from "@/api/fintechApi";

interface SavingsVaultCardProps {
  vault: SavingsVault;
  onClaim: (id: string) => void;
}

export const SavingsVaultCard: React.FC<SavingsVaultCardProps> = ({ vault, onClaim }) => {
  const isLocked = vault.status === "LOCKED";
  const isMatured = isLocked && new Date(vault.end_date) < new Date();
  const daysLeft = isLocked
    ? Math.max(0, Math.ceil((new Date(vault.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-white">{vault.amount.toLocaleString()} TCoin</p>
          <p className="text-[10px] text-gray-400">{vault.apy_rate}% APY</p>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-semibold border ${
            vault.status === "LOCKED"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : vault.status === "CLAIMED"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}
        >
          {vault.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(vault.start_date).toLocaleDateString()} - {new Date(vault.end_date).toLocaleDateString()}
        </span>
        {isLocked && (
          <span className={isMatured ? "text-emerald-400" : "text-gray-500"}>
            {isMatured ? "Matured" : `${daysLeft} days left`}
          </span>
        )}
      </div>
      {isMatured && (
        <button
          onClick={() => onClaim(vault.id)}
          className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors"
        >
          Claim Rewards
        </button>
      )}
    </div>
  );
};
