"use client";

import React from "react";
import { Heart, Flame, Hand, Rocket, TrendingUp } from "lucide-react";
import { ReactionButton } from "@/components/social/ReactionButton";
import { TipModal } from "@/components/social/TipModal";
import { EarningFeedEntry } from "@/api/socialApi";

const REACTION_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  LIKE: { icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  FIRE: { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  CLAP: { icon: Hand, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ROCKET: { icon: Rocket, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
};

interface EarningFeedProps {
  entries: EarningFeedEntry[];
  onReact: (feedEntryId: string, reactionType: string) => void;
  onTip?: (recipientId: string, recipientName: string) => void;
}

export const EarningFeed: React.FC<EarningFeedProps> = ({ entries, onReact, onTip }) => {
  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No feed entries yet. Be the first to share!</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                  {(entry.username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{entry.username || "Anonymous"}</p>
                  <p className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              {entry.amount && entry.currency && (
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    +{entry.currency === "TCOIN" ? `${entry.amount.toFixed(2)} TC` : `$${entry.amount.toFixed(2)}`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
              {entry.description && <p className="text-xs text-slate-400 mt-1">{entry.description}</p>}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <ReactionButton
                feedEntryId={entry.id}
                reactions={[
                  { reaction_type: "LIKE", count: Math.floor(Math.random() * 10) },
                  { reaction_type: "FIRE", count: Math.floor(Math.random() * 10) },
                  { reaction_type: "CLAP", count: Math.floor(Math.random() * 5) },
                  { reaction_type: "ROCKET", count: Math.floor(Math.random() * 5) },
                ]}
                userReaction={entry.user_reaction}
                onReact={onReact}
              />
              {onTip && entry.user_id && (
                <button
                  onClick={() => onTip(entry.user_id, entry.username || "User")}
                  className="text-[10px] px-2 py-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  Tip
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
