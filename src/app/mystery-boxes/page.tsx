"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { mysteryBoxApi } from "@/api/mysteryBoxApi";
import { UserMysteryBox } from "@/lib/types";
import { Gift, Package, Sparkles, Flame, Zap, Trophy } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-slate-300 border-slate-600 bg-slate-950/60",
  RARE: "text-blue-400 border-blue-500 bg-blue-950/40",
  EPIC: "text-purple-400 border-purple-500 bg-purple-950/40",
  LEGENDARY: "text-amber-400 border-amber-500 bg-amber-950/40",
};

export default function MysteryBoxesPage() {
  const { setActiveModule, mysteryBoxes, setMysteryBoxes, wallet } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("mystery-boxes");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mysteryBoxApi.getUserBoxes();
        setMysteryBoxes(res.boxes);
      } catch (error) {
        console.error("Failed to fetch mystery boxes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setMysteryBoxes]);

  const handleOpen = async (boxId: string) => {
    setOpening(boxId);
    try {
      await mysteryBoxApi.openBox(boxId);
      const res = await mysteryBoxApi.getUserBoxes();
      setMysteryBoxes(res.boxes);
    } catch (error) {
      console.error("Failed to open box:", error);
    } finally {
      setOpening(null);
    }
  };

  const handleClaim = async (boxId: string) => {
    setClaiming(boxId);
    try {
      await mysteryBoxApi.claimBoxReward(boxId);
      const res = await mysteryBoxApi.getUserBoxes();
      setMysteryBoxes(res.boxes);
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "tcoin_bonus": return <Zap size={14} className="text-amber-400" />;
      case "streak_repair": return <Flame size={14} className="text-orange-500" />;
      case "instant_withdrawal_voucher": return <Trophy size={14} className="text-emerald-400" />;
      default: return <Gift size={14} className="text-indigo-400" />;
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
          <h1 className="text-lg font-bold text-white">Mystery Boxes</h1>
          <p className="text-[10px] text-slate-400">Complete 5 tasks daily to earn rewards</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Your Boxes</h2>
          </div>
          {mysteryBoxes.length === 0 ? (
            <div className="text-center py-8">
              <Gift size={48} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No mystery boxes yet</p>
              <p className="text-xs text-slate-500 mt-1">Complete 5 tasks in a day to earn one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mysteryBoxes.map((box) => (
                <div
                  key={box.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${RARITY_COLORS[box.rarity || "COMMON"]}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {box.opened ? (
                        box.rarity === "LEGENDARY" ? <Trophy size={24} className="text-amber-400" /> :
                        box.rarity === "EPIC" ? <Sparkles size={24} className="text-purple-400" /> :
                        box.rarity === "RARE" ? <Zap size={24} className="text-blue-400" /> :
                        <Gift size={24} className="text-slate-300" />
                      ) : (
                        <Package size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{box.box_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {box.opened ? `Reward: ${box.reward_type || "Unknown"}` : "Not opened"}
                      </p>
                      {box.opened && box.reward_amount && (
                        <p className="text-[10px] text-emerald-400 font-bold">
                          +{box.reward_amount} {box.reward_currency || "TCN"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!box.opened && (
                      <button
                        onClick={() => handleOpen(box.id)}
                        disabled={opening === box.id}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold disabled:opacity-50"
                      >
                        {opening === box.id ? "Opening..." : "Open"}
                      </button>
                    )}
                    {box.opened && !box.claimed && (
                      <button
                        onClick={() => handleClaim(box.id)}
                        disabled={claiming === box.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold disabled:opacity-50"
                      >
                        {claiming === box.id ? "Claiming..." : "Claim"}
                      </button>
                    )}
                    {box.claimed && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Claimed
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
