"use client";

import React from "react";
import { Users, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { GroupTaskPool } from "@/lib/types";

interface GroupTaskPoolCardProps {
  pool: GroupTaskPool;
  onJoin: () => void;
  isJoining?: boolean;
}

export const GroupTaskPoolCard: React.FC<GroupTaskPoolCardProps> = ({ pool, onJoin, isJoining = false }) => {
  const progress = Math.min((pool.current_participants / pool.required_participants) * 100, 100);
  const isFilled = pool.status === "FILLED" || pool.status === "EXPIRED";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Users size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Group Task Pool</h3>
            <p className="text-[10px] text-slate-500">#{pool.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
          <DollarSign size={10} className="text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">{pool.group_payout_multiplier}x</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-medium">
            {pool.current_participants} / {pool.required_participants}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>
            Ends: {new Date(pool.window_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 size={10} />
          <span className={isFilled ? "text-rose-400" : "text-emerald-400"}>
            {pool.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <button
        onClick={onJoin}
        disabled={isFilled || isJoining}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isJoining ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Joining...
          </>
        ) : isFilled ? (
          "Pool Closed"
        ) : (
          "Join Pool"
        )}
      </button>
    </div>
  );
};
