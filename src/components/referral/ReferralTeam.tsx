"use client";

import React from "react";
import { UserPlus, Crown } from "lucide-react";

interface ReferralTeamProps {
  team: Array<{
    user_id: string;
    username: string;
    tier_level: number;
    joined_at: string;
  }>;
}

export const ReferralTeam: React.FC<ReferralTeamProps> = ({ team }) => {
  if (team.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-sm text-gray-400">No referrals yet</p>
        <p className="text-xs text-gray-500">Share your link to start earning</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {team.map((member) => (
        <div
          key={member.user_id}
          className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800 hover:border-gray-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.tier_level === 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{member.username}</p>
              <p className="text-[10px] text-gray-500">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Crown size={12} className={member.tier_level === 1 ? "text-emerald-400" : "text-amber-400"} />
            <span className="text-[10px] font-bold text-gray-300">T{member.tier_level}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
