"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { badgesApi } from "@/api/badgesApi";
import { UserBadge } from "@/lib/types";
import { Award, Sparkles, Flame, Zap, Shield, Trophy } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-slate-300 border-slate-600",
  RARE: "text-blue-400 border-blue-500",
  EPIC: "text-purple-400 border-purple-500",
  LEGENDARY: "text-amber-400 border-amber-500",
};

export default function BadgesPage() {
  const { setActiveModule, userBadges, setUserBadges } = useAppStore();
  const [badgeTypes, setBadgeTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("badges");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, userRes] = await Promise.all([
          badgesApi.getBadgeTypes(),
          badgesApi.getUserBadges(),
        ]);
        setBadgeTypes(typesRes);
        setUserBadges(userRes.badges);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setUserBadges]);

  const handleEquip = async (badgeId: string) => {
    try {
      await badgesApi.equipBadge(badgeId);
      const userRes = await badgesApi.getUserBadges();
      setUserBadges(userRes.badges);
    } catch (error) {
      console.error("Failed to equip badge:", error);
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY": return <Trophy size={14} className="text-amber-400" />;
      case "EPIC": return <Sparkles size={14} className="text-purple-400" />;
      case "RARE": return <Zap size={14} className="text-blue-400" />;
      default: return <Shield size={14} className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Badges</h1>
          <p className="text-[10px] text-slate-400">Collectible badges that boost earnings</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Your Badges</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {userBadges.length} earned
            </span>
          </div>
          {userBadges.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No badges yet. Complete milestones to earn them!</p>
          ) : (
            <div className="space-y-2">
              {userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${RARITY_COLORS[badge.rarity] || "border-slate-600"} bg-slate-950/60`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{badge.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{badge.description}</p>
                      {badge.earning_boost_pct > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Flame size={10} className="text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">+{badge.earning_boost_pct}% earnings</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRarityIcon(badge.rarity)}
                    {!badge.is_equipped && (
                      <button
                        onClick={() => handleEquip(badge.id)}
                        className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold"
                      >
                        Equip
                      </button>
                    )}
                    {badge.is_equipped && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Equipped
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Badges</h2>
          <div className="space-y-2">
            {badgeTypes.map((badge) => {
              const earned = userBadges.find((ub) => ub.badge_type_id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 ${earned ? "border-emerald-500/30" : "border-slate-800"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{badge.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{badge.description}</p>
                      {badge.earning_boost_pct > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Flame size={10} className="text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">+{badge.earning_boost_pct}% earnings</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRarityIcon(badge.rarity)}
                    {earned ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Earned
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
