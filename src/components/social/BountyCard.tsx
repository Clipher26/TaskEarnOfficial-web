"use client";

import React from "react";
import { Clock, ExternalLink, Users } from "lucide-react";
import { BountyBoardEntry } from "@/api/socialApi";

interface BountyCardProps {
  bounty: BountyBoardEntry;
  onComplete?: (bountyId: string) => void;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty, onComplete }) => {
  const progress = bounty.max_completions ? (bounty.completions / bounty.max_completions) * 100 : 0;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{bounty.title}</h3>
          <p className="text-[10px] text-slate-400">by {bounty.poster_username || "Anonymous"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-amber-400">{bounty.reward_amount}</p>
          <p className="text-[10px] text-slate-500">{bounty.reward_currency}</p>
        </div>
      </div>

      {bounty.description && <p className="text-xs text-slate-400 line-clamp-2">{bounty.description}</p>}

      {bounty.max_completions && (
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Users size={10} />
            <span>{bounty.completions}/{bounty.max_completions || "∞"}</span>
          </div>
          {bounty.expiry_date && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock size={10} />
              <span>{new Date(bounty.expiry_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {bounty.task_url && (
            <a href={bounty.task_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 flex items-center gap-1">
              <ExternalLink size={10} /> Open
            </a>
          )}
          {onComplete && bounty.status === "ACTIVE" && (
            <button onClick={() => onComplete(bounty.id)} className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all">
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
