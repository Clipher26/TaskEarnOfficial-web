"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { earnflipApi, EarnflipTask } from "@/api/earnflipApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Search, Filter, Trophy, Clock, Users, CheckCircle2, XCircle, Loader2, Crown, Lock } from "lucide-react";

type TaskTab = "available" | "my-submissions";

const TIER_ORDER = ["FREE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE_TRADER"];

function hasMinTier(userTier: string, minTier: string): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier);
  const minIdx = TIER_ORDER.indexOf(minTier);
  return userIdx >= minIdx;
}

export default function EarnflipPage() {
  const { setActiveModule, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskTab>("available");
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [lastTaskRefresh, setLastTaskRefresh] = useState<string>(new Date().toISOString().split("T")[0]);
  const { isLoggedIn, isLoading } = useRequireAuth();

  const vipTier = user?.vip_tier || "FREE";
  const canAccess = hasMinTier(vipTier, "BRONZE");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflip");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        if (activeTab === "available") {
          const data = await earnflipApi.listTasks({
            search: search || undefined,
            difficulty: (difficultyFilter as any) || undefined,
            platform: (platformFilter as any) || undefined,
            page,
            limit: 20,
          });
          setTasks(data);
        } else {
          const data = await earnflipApi.getMySubmissions();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Failed to fetch earnflip data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canAccess, activeTab, search, difficultyFilter, platformFilter, page]);

  useEffect(() => {
    if (!canAccess) return;
    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastTaskRefresh) {
        setLastTaskRefresh(today);
        // Refresh logic handled by main fetch effect
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [canAccess, lastTaskRefresh]);

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">EarnFlip</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <Lock size={32} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Bronze Tier Required</h2>
          <p className="text-sm text-slate-400 mb-4">Upgrade to Bronze VIP to unlock EarnFlip quick-flip earning games.</p>
          <button
            onClick={() => window.location.href = "/vip"}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Crown size={16} />
            View VIP Tiers
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const handleSubmitTask = async (taskId: string) => {
    if (taskId.startsWith("offer_")) {
      const task = tasks.find(t => t.id === taskId);
      if (task && (task as any).action_url) {
        window.open((task as any).action_url, "_blank");
        return;
      }
    }
    try {
      await earnflipApi.submitTask(taskId, {
        proof_data: "completed",
        started_at: new Date().toISOString(),
      });
      setActiveTab("my-submissions");
      const data = await earnflipApi.getMySubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to submit task:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "PENDING":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "REJECTED":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-emerald-400 bg-emerald-500/10";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10";
      case "HARD":
        return "text-rose-400 bg-rose-500/10";
      default:
        return "text-slate-400 bg-slate-800";
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Earnflip</h1>
          <p className="text-[10px] text-slate-400">Complete micro-tasks, earn rewards</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "available"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            Available Tasks
          </button>
          <button
            onClick={() => setActiveTab("my-submissions")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "my-submissions"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            My Submissions
          </button>
        </div>

        {activeTab === "available" && (
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">All Platforms</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="TWITTER">Twitter</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIKTOK">TikTok</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="WEB">Web</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "available" && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Trophy size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No tasks available</p>
                <p className="text-xs text-slate-500 mt-1">Check back later for new tasks!</p>
              </div>
            ) : (
              tasks.map((task) => {
                const isOfferwall = task.id.startsWith("offer_");
                return (
                  <div key={task.id} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white">{task.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                          {isOfferwall && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                              OFFERWALL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Trophy size={10} className="text-amber-400" />
                            {task.reward_amount} {task.reward_currency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} className="text-indigo-400" />
                            {task.estimated_duration_minutes ? `${task.estimated_duration_minutes} min` : "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={10} className="text-cyan-400" />
                            {task.total_completions}/{task.max_participants || "∞"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubmitTask(task.id)}
                      className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all ${
                        isOfferwall
                          ? "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20"
                          : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20"
                      }`}
                    >
                      {isOfferwall ? "Open Offer" : "Start Task"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "my-submissions" && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No submissions yet</p>
                <p className="text-xs text-slate-500 mt-1">Complete tasks to see them here!</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">Submission #{sub.id.slice(0, 8)}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Task: {sub.task_id}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Created: {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {sub.reward_credited && (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </div>
                  {sub.review_note && (
                    <div className="mt-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400">Review Note: {sub.review_note}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
