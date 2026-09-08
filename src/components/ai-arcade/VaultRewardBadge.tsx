"use client";

import React from "react";
import { Trophy, Lock, Unlock, Users, Zap } from "lucide-react";

interface VaultRewardBadgeProps {
  vault: {
    id: string;
    title: string;
    entry_fee: number;
    reward_pool: number;
    status: string;
    current_attempts: number;
    breach_count: number;
    max_attempts?: number;
  };
}

export function VaultRewardBadge({ vault }: VaultRewardBadgeProps) {
  const isBreached = vault.status === "BREACHED";
  const isLocked = vault.status === "LOCKED";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isBreached ? (
            <Unlock className="text-emerald-400" size={18} />
          ) : (
            <Lock className="text-amber-400" size={18} />
          )}
          <h3 className="text-sm font-bold text-white">{vault.title}</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          isBreached ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
          isLocked ? "bg-slate-800 text-slate-400 border border-slate-700" :
          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
          {vault.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
          <Zap size={12} className="text-amber-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">Entry</p>
          <p className="text-xs font-bold text-white">{vault.entry_fee}</p>
        </div>
        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
          <Trophy size={12} className="text-indigo-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">Pool</p>
          <p className="text-xs font-bold text-white">{vault.reward_pool}</p>
        </div>
        <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
          <Users size={12} className="text-rose-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">Attempts</p>
          <p className="text-xs font-bold text-white">{vault.current_attempts}{vault.max_attempts ? `/${vault.max_attempts}` : ""}</p>
        </div>
      </div>

      {isBreached && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-[10px] text-emerald-400 font-bold text-center">VAULT BREACHED - REWARD UNLOCKED</p>
        </div>
      )}
    </div>
  );
}
