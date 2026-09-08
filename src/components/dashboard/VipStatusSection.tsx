"use client";

import React from "react";
import { VipTierCard } from "./VipTierCard";
import { VipProgressTracker } from "./VipProgressTracker";
import { VipUnlockList } from "./VipUnlockList";
import { useVipData, UserVipData } from "@/hooks/useVipData";

interface VipStatusSectionProps {
  userId?: string;
  onUpgradeClick?: () => void;
}

const TIERS = [
  {
    title: "Silver",
    levelRange: "11-25",
    iconType: "shield" as const,
    colorClass: "text-gray-300",
    glowClass: "shadow-gray-500/10",
    features: [
      { label: "0.08% Trade Fees", included: true },
      { label: "5% Task Bonus", included: true },
      { label: "Earnflip Access", included: true },
      { label: "Priority Support", included: false },
    ],
  },
  {
    title: "Gold",
    levelRange: "26-50",
    iconType: "xp" as const,
    colorClass: "text-amber-400",
    glowClass: "shadow-amber-500/20",
    features: [
      { label: "0.05% Trade Fees", included: true },
      { label: "10% Task Bonus", included: true },
      { label: "Premium Earnpoly Rooms", included: true },
      { label: "Earnclash Basic Rooms", included: true },
    ],
  },
];

const UPCOMING_PERKS = [
  { label: "Earnflip Access", unlocked: true },
  { label: "Earnclash Basic Rooms", unlocked: true },
  { label: "Lower Trade Fees", unlocked: false },
  { label: "Earnclash Premium Rooms", unlocked: false },
];

export const VipStatusSection: React.FC<VipStatusSectionProps> = ({ userId, onUpgradeClick }) => {
  const { data, loading, error } = useVipData(userId);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">VIP Tiers</h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">VIP Tiers</h2>
        <p className="text-xs text-gray-500 text-center py-4">
          {error || "No VIP data available"}
        </p>
      </section>
    );
  }

  const currentTierIndex = TIERS.findIndex((tier) => {
    const [min, max] = tier.levelRange.split("-").map(Number);
    return data.currentVipLevel >= min && data.currentVipLevel <= max;
  });

  const hasNextTier = currentTierIndex < TIERS.length - 1;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">VIP Tiers</h2>
        {hasNextTier && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
          >
            Upgrade Tier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIERS.map((tier, index) => (
          <VipTierCard
            key={tier.title}
            title={tier.title}
            levelRange={tier.levelRange}
            iconType={tier.iconType}
            colorClass={tier.colorClass}
            glowClass={tier.glowClass}
            features={tier.features}
            isCurrentTier={index === currentTierIndex}
          />
        ))}
      </div>

      <VipProgressTracker
        currentXp={data.totalXp}
        goalXp={data.nextTierGoalXp}
        nextTierTitle={data.nextTierTitle}
        currentMultiplier={data.currentMultiplier}
      />

      <VipUnlockList perks={UPCOMING_PERKS} />
    </section>
  );
};
