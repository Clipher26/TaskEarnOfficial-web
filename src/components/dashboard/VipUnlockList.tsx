"use client";

import React from "react";
import { Lock, Unlock } from "lucide-react";

interface PerkItem {
  label: string;
  unlocked: boolean;
}

interface VipUnlockListProps {
  perks: PerkItem[];
}

export const VipUnlockList: React.FC<VipUnlockListProps> = ({ perks }) => {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
        Higher VIP Tiers Unlock:
      </h4>
      <ul className="space-y-2">
        {perks.map((perk, index) => (
          <li key={index} className="flex items-center gap-2.5">
            {perk.unlocked ? (
              <Unlock size={14} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <Lock size={14} className="text-gray-500 flex-shrink-0" />
            )}
            <span
              className={`text-[11px] font-medium ${
                perk.unlocked ? "text-emerald-400" : "text-gray-400"
              }`}
            >
              {perk.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
