"use client";

import React from "react";
import { Users, TrendingUp, Award, Wallet } from "lucide-react";

interface ReferralStatsProps {
  stats: {
    total_referrals: number;
    total_earnings_usdt: number;
    tier1_count: number;
    tier2_count: number;
  };
}

export const ReferralStats: React.FC<ReferralStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: "Total Referrals",
      value: stats.total_referrals.toString(),
      icon: Users,
      color: "emerald",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    {
      label: "Total Earnings",
      value: `$${stats.total_earnings_usdt.toFixed(2)}`,
      icon: Wallet,
      color: "cyan",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
    },
    {
      label: "Tier 1 Referrals",
      value: stats.tier1_count.toString(),
      icon: TrendingUp,
      color: "amber",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    {
      label: "Tier 2 Referrals",
      value: stats.tier2_count.toString(),
      icon: Award,
      color: "violet",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`p-4 rounded-2xl border ${item.border} ${item.bg} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={item.text} />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className={`text-2xl font-extrabold ${item.text}`}>{item.value}</p>
          </div>
        );
      })}
    </div>
  );
};
