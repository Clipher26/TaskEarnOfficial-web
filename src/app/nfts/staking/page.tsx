"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { nftApi } from "@/api/nftApi";
import { Lock, TrendingUp, ArrowLeft, AlertTriangle } from "lucide-react";

export default function NFTStakingPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [dashboard, setDashboard] = useState<{ stakings: any[]; total_rewards: number; active_count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadDashboard();
  }, [isLoggedIn]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await nftApi.getStakingDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load staking dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              NFT Staking
            </h1>
            <p className="text-gray-400 text-sm mt-1">Stake your NFTs to earn passive rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">${dashboard?.total_rewards.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Active Stakes</p>
            <p className="text-2xl font-bold text-white mt-1">{dashboard?.active_count || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Avg. Reward Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{dashboard && dashboard.stakings.length > 0 ? (dashboard.stakings.reduce((a, b) => a + b.reward_rate, 0) / dashboard.stakings.length).toFixed(1) : "0"}%</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dashboard?.stakings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No NFTs staked yet</p>
            <button onClick={() => router.push("/nfts")} className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700">
              Go to NFTs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboard?.stakings.map((staking) => (
              <div key={staking.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">NFT #{staking.nft_id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-400 mt-1">Duration: {staking.staking_duration} days</p>
                    <p className="text-sm text-gray-400">Reward Rate: {staking.reward_rate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">${staking.rewards_earned.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">Rewards Earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
