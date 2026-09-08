"use client";

import React from "react";
import { Heart, Flame, Hand, Rocket, Share2 } from "lucide-react";

const REACTION_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  LIKE: { icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  FIRE: { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  CLAP: { icon: Hand, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ROCKET: { icon: Rocket, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
};

export interface ReactionButtonProps {
  feedEntryId: string;
  reactions: { reaction_type: string; count: number }[];
  userReaction?: string;
  onReact: (feedEntryId: string, reactionType: string) => void;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ feedEntryId, reactions, userReaction, onReact }) => {
  return (
    <div className="flex items-center gap-1.5">
      {Object.entries(REACTION_MAP).map(([type, config]) => {
        const Icon = config.icon;
        const reaction = reactions.find((r) => r.reaction_type === type);
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            onClick={() => onReact(feedEntryId, type)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all active:scale-95 ${
              isActive
                ? `${config.color} ${config.bg}`
                : "text-slate-500 hover:text-slate-300 border-transparent hover:border-slate-700"
            }`}
          >
            <Icon size={12} />
            {reaction?.count || 0}
          </button>
        );
      })}
    </div>
  );
};
