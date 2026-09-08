"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Flame, Gift, Zap, Trophy, Star, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { streakApi, StreakData } from "@/api/streakApi";

const DAILY_REWARDS = [0.3, 0.6, 0.9, 1.2, 1.5, 2.1, 3.0];

function getNextCheckIn(lastLoginDate: string | null): Date | null {
  if (!lastLoginDate) return null;
  const last = new Date(lastLoginDate);
  const next = new Date(last);
  next.setHours(next.getHours() + 24);
  return next;
}

function getTimeRemaining(nextCheckIn: Date | null): { hours: number; minutes: number; seconds: number } | null {
  if (!nextCheckIn) return null;
  const now = new Date();
  const diff = nextCheckIn.getTime() - now.getTime();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function StreakPage() {
  const { setActiveModule, user } = useAppStore();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const { isLoggedIn, isLoading } = useRequireAuth();

  const fetchStreak = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await streakApi.getMyStreak(user.id);
      setStreakData(data);
      setMultiplier(data.earned_multiplier);
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("streak");
    fetchStreak();
  }, [isLoggedIn, isLoading, setActiveModule, fetchStreak]);

  useEffect(() => {
    if (!streakData?.last_login_date) {
      setTimeRemaining(null);
      return;
    }
    const nextCheckIn = getNextCheckIn(streakData.last_login_date);
    if (!nextCheckIn) return;

    const updateTimer = () => {
      const remaining = getTimeRemaining(nextCheckIn);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [streakData?.last_login_date]);

  const handleCheckin = async () => {
    if (!user?.id || !streakData) return;
    setIsCheckingIn(true);
    try {
      const result = await streakApi.recordLogin(user.id);
      setStreakData((prev) => prev ? {
        ...prev,
        current_streak: result.current_streak,
        earned_multiplier: result.multiplier,
        last_login_date: new Date().toISOString(),
      } : prev);
      setMultiplier(result.multiplier);

      const dayInWeek = ((result.current_streak - 1) % 7) + 1;
      if (dayInWeek === 7) {
        setShowWheel(true);
      }
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const spinWheel = () => {
    const outcomes = [
      { label: "1.2x CRED", type: "COMMON", color: "text-slate-300" },
      { label: "1.5x CRED", type: "COMMON", color: "text-slate-300" },
      { label: "2.0x CRED", type: "RARE", color: "text-blue-400" },
      { label: "$0.50 USDT", type: "RARE", color: "text-blue-400" },
      { label: "5.0x CRED", type: "EPIC", color: "text-purple-400" },
      { label: "$2.00 USDT", type: "EPIC", color: "text-purple-400" },
      { label: "10x CRED", type: "LEGENDARY", color: "text-amber-400" },
      { label: "$5.00 USDT", type: "LEGENDARY", color: "text-amber-400" },
    ];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    setWheelResult(result.label);
    setMultiplier(result.type === "LEGENDARY" ? 50 : result.type === "EPIC" ? 10 : result.type === "RARE" ? 5 : 1.5);
  };

  const canCheckIn = !timeRemaining || (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0);
  const dayInWeek = streakData ? ((streakData.current_streak - 1) % 7) + 1 : 0;
  const todayReward = DAILY_REWARDS[dayInWeek - 1] || 0.3;
  const finalReward = todayReward * multiplier;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Daily Streak</h1>
          <p className="text-[10px] text-slate-400">Login daily to earn Tcoin rewards</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Current Streak</p>
              <p className="text-3xl font-bold text-white flex items-center gap-2">
                {streakData?.current_streak || 0} <Flame size={28} className="text-orange-500" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Longest Streak</p>
              <p className="text-2xl font-bold text-amber-400">{streakData?.longest_streak || 0}</p>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`
                  flex-1 h-3 rounded-full transition-all
                  ${day <= ((streakData?.current_streak || 0) % 7 || 7) ? "bg-emerald-500" : "bg-slate-800"}
                  ${day === dayInWeek ? "ring-2 ring-amber-400" : ""}
                `}
              />
            ))}
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-slate-400">Today&apos;s Reward</p>
                <p className="text-lg font-bold text-emerald-400">
                  +{finalReward.toFixed(2)} TCN
                </p>
                <p className="text-[10px] text-slate-500">~${(finalReward / 30).toFixed(4)} USD</p>
              </div>
              {multiplier > 1.0 && (
                <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                  <Zap size={14} className="text-purple-400" />
                  <span className="text-xs font-bold text-purple-400">{multiplier}x</span>
                </div>
              )}
            </div>
          </div>

          {timeRemaining && !canCheckIn ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 py-3">
              <Clock size={16} />
              <span className="text-sm font-mono">
                Next check-in in {String(timeRemaining.hours).padStart(2, "0")}:
                {String(timeRemaining.minutes).padStart(2, "0")}:
                {String(timeRemaining.seconds).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={isCheckingIn || !canCheckIn}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCheckingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift size={18} />
                  Claim Daily Reward
                </>
              )}
            </button>
          )}
        </div>

        {showWheel && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white text-center mb-4">
              🎰 Lucky Multiplier Wheel
            </h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              Day 7 Streak Bonus! Spin to win multipliers and USDT bonuses!
            </p>

            {!wheelResult ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex items-center justify-center bg-slate-950">
                  <Trophy size={48} className="text-amber-400" />
                </div>
                <button
                  onClick={spinWheel}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Spin Wheel
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Star size={40} className="text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-400 mb-2">{wheelResult}</p>
                <button
                  onClick={() => {
                    setShowWheel(false);
                    setWheelResult(null);
                    fetchStreak();
                  }}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                >
                  Claim & Close
                </button>
              </div>
            )}
          </div>
        )}

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Weekly Progress</h3>
          <div className="space-y-2">
            {DAILY_REWARDS.map((reward, idx) => {
              const day = idx + 1;
              const isClaimed = day <= ((streakData?.current_streak || 0) % 7 || 7);
              const isToday = day === dayInWeek;
              return (
                <div
                  key={day}
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl border
                    ${isToday ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-950/60 border-slate-800"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${isClaimed ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"}
                    `}>
                      {isClaimed ? <CheckCircle2 size={16} /> : day}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Day {day}</p>
                      <p className="text-[10px] text-slate-400">{reward.toFixed(2)} TCN</p>
                    </div>
                  </div>
                  {isToday && !isClaimed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      TODAY
                    </span>
                  )}
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
