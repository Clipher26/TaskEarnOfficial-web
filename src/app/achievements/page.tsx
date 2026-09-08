"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { achievementsApi } from "@/api/achievementsApi";
import { UserAchievement, SkillTree } from "@/lib/types";
import { Target, Zap, Trophy, Star, CheckCircle2, Gift } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AchievementsPage() {
  const { setActiveModule, userAchievements, setUserAchievements, skillTree, setSkillTree } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [spendingPath, setSpendingPath] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("achievements");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achRes, treeRes] = await Promise.all([
          achievementsApi.listAchievements(),
          achievementsApi.getSkillTree(),
        ]);
        setUserAchievements(achRes.achievements);
        setSkillTree(treeRes);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setUserAchievements, setSkillTree]);

  const handleClaim = async (achievementId: string) => {
    setClaiming(achievementId);
    try {
      await achievementsApi.claimAchievementReward(achievementId);
      const res = await achievementsApi.listAchievements();
      setUserAchievements(res.achievements);
    } catch (error) {
      console.error("Failed to claim:", error);
    } finally {
      setClaiming(null);
    }
  };

  const handleSpendPoint = async (path: string) => {
    setSpendingPath(path);
    try {
      const res = await achievementsApi.spendSkillPoint(path);
      setSkillTree(res.skill_tree);
    } catch (error) {
      console.error("Failed to spend skill point:", error);
    } finally {
      setSpendingPath(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const st = skillTree as SkillTree | null;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Achievements</h1>
          <p className="text-[10px] text-slate-400">Complete tasks, earn skill points, upgrade paths</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {st && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Skill Tree</h2>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                <Star size={12} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{st.available_points} pts</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { path: "survey_master", label: "Survey Master", value: st.survey_master_points, desc: "+10% survey rewards" },
                { path: "fast_cash", label: "Fast Cash", value: st.fast_cash_points, desc: "-50% withdrawal fees" },
                { path: "earnpoly_ace", label: "Earnpoly Ace", value: st.earnpoly_ace_points, desc: "+5% Earnpoly earnings" },
                { path: "trading_whale", label: "Trading Whale", value: st.trading_whale_points, desc: "Reduced trade fees" },
              ].map((item) => (
                <div key={item.path} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-indigo-400">Lv {item.value}</span>
                    <button
                      onClick={() => handleSpendPoint(item.path)}
                      disabled={!st.available_points || spendingPath === item.path}
                      className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold disabled:opacity-50"
                    >
                      {spendingPath === item.path ? "Upgrading..." : "+1"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Achievements</h2>
          </div>
          {userAchievements.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No achievements yet. Keep completing tasks!</p>
          ) : (
            <div className="space-y-2">
              {userAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 ${
                    ach.completed ? "border-emerald-500/30" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {ach.completed ? <Trophy size={24} className="text-amber-400" /> : <Target size={24} className="text-slate-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{ach.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ach.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min((ach.progress_count / (ach.achievement_type === "TASK_MASTER" ? 50 : 10)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{ach.progress_count}/{ach.achievement_type === "TASK_MASTER" ? "50" : "10"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {ach.completed && !ach.claimed && (
                      <button
                        onClick={() => handleClaim(ach.achievement_id)}
                        disabled={claiming === ach.achievement_id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold disabled:opacity-50"
                      >
                        <Gift size={10} />
                        {claiming === ach.achievement_id ? "..." : "Claim"}
                      </button>
                    )}
                    {ach.claimed && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Claimed
                      </span>
                    )}
                    {!ach.completed && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
