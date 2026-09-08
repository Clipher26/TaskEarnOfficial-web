"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { bossBattleApi } from "@/api/bossBattleApi";
import { BossBattle } from "@/lib/types";
import { Sword, Users, Flame, Trophy, Zap, Target } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function BossBattlePage() {
  const { setActiveModule, activeBossBattle, setActiveBossBattle } = useAppStore();
  const [battles, setBattles] = useState<BossBattle[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("boss-battle");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [battlesRes, progressRes] = await Promise.all([
          bossBattleApi.listBattles(),
          bossBattleApi.getUserProgress(),
        ]);
        setBattles(battlesRes.battles);
        setUserProgress(progressRes);
        const active = battlesRes.battles.find((b) => b.status === "ACTIVE");
        if (active) setActiveBossBattle(active);
      } catch (error) {
        console.error("Failed to fetch boss battles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setActiveBossBattle]);

  const handleContribute = async () => {
    setContributing(true);
    try {
      const res = await bossBattleApi.contributeTask();
      setActiveBossBattle(res.battle);
      setUserProgress((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          boss_battle_id: res.battle.id,
          user_id: "",
          tasks_contributed: res.tasks_contributed,
        },
      ]);
    } catch (error) {
      console.error("Failed to contribute:", error);
    } finally {
      setContributing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeBattle = battles.find((b) => b.status === "ACTIVE") || activeBossBattle;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Boss Battles</h1>
          <p className="text-[10px] text-slate-400">Team up to defeat the boss and earn multipliers</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {activeBattle && (
          <div className="glass-card p-5 border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sword size={20} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-white">{activeBattle.name}</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">{activeBattle.description}</p>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Boss HP</span>
                <span className="text-xs text-white font-mono">
                  {activeBattle.total_tasks_completed} / {activeBattle.target_tasks}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(activeBattle.progress_pct, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{activeBattle.progress_pct.toFixed(1)}% complete</span>
                <div className="flex items-center gap-1">
                  <Trophy size={12} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-bold">{activeBattle.reward_multiplier}x earnings</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400">Community</span>
              </div>
              <span className="text-xs text-white">Global Event</span>
            </div>

            <button
              onClick={handleContribute}
              disabled={contributing}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {contributing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Contributing...
                </>
              ) : (
                <>
                  <Target size={18} />
                  Complete Task for Battle
                </>
              )}
            </button>
          </div>
        )}

        <div className="glass-card p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Contribution</h2>
          {userProgress.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No tasks contributed yet.</p>
          ) : (
            <div className="space-y-2">
              {userProgress.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" />
                    <span className="text-xs text-white">Tasks Contributed</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-400">{p.tasks_contributed}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Battle History</h2>
          {battles.filter((b) => b.status !== "ACTIVE").length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No previous battles.</p>
          ) : (
            <div className="space-y-2">
              {battles
                .filter((b) => b.status !== "ACTIVE")
                .map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-xs font-medium text-white">{b.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {b.total_tasks_completed} / {b.target_tasks} tasks
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        b.status === "VICTORY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {b.status}
                    </span>
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
