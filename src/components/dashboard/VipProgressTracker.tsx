"use client";

import React from "react";
import { Gauge } from "lucide-react";

interface VipProgressTrackerProps {
  currentXp: number;
  goalXp: number;
  nextTierTitle: string;
  currentMultiplier: number;
}

export const VipProgressTracker: React.FC<VipProgressTrackerProps> = ({
  currentXp,
  goalXp,
  nextTierTitle,
  currentMultiplier,
}) => {
  const progressPercent = Math.min((currentXp / goalXp) * 100, 100);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* View 1: XP to Next Tier */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-emerald-500" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            XP to Next Tier ({nextTierTitle})
          </h4>
        </div>

        <div className="w-full bg-gray-900 rounded-full h-3 mb-2 overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400 font-medium text-center">
          {currentXp.toLocaleString()} / {goalXp.toLocaleString()} XP
        </p>
      </div>

      {/* View 2: Platform Usage Multiplier */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-amber-500" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Multiplier
          </h4>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="text-amber-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white">
                {currentMultiplier.toFixed(2)}x
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                Bonus
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
