"use client";

import React from "react";
import { Shield, Zap } from "lucide-react";

interface TierFeature {
  label: string;
  included: boolean;
}

interface VipTierCardProps {
  title: string;
  levelRange: string;
  iconType: "shield" | "xp";
  colorClass: string;
  glowClass: string;
  features: TierFeature[];
  isCurrentTier?: boolean;
}

export const VipTierCard: React.FC<VipTierCardProps> = ({
  title,
  levelRange,
  iconType,
  colorClass,
  glowClass,
  features,
  isCurrentTier = false,
}) => {
  const Icon = iconType === "shield" ? Shield : Zap;

  return (
    <div
      className={`
        relative rounded-xl border border-gray-700 bg-gray-800/40 p-4
        transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
        ${isCurrentTier ? glowClass : "hover:border-gray-600"}
      `}
    >
      {isCurrentTier && (
        <div className="absolute -top-2.5 left-4">
          <span className="text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full shadow-md">
            CURRENT
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-gray-700/40 border border-gray-600`}>
          <Icon size={20} strokeWidth={2.5} className={colorClass} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-[10px] text-gray-400 font-medium">Level {levelRange}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-[11px] text-gray-400">
            <span
              className={`w-1 h-1 rounded-full flex-shrink-0 ${
                feature.included ? "bg-emerald-500" : "bg-gray-600"
              }`}
            />
            {feature.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
