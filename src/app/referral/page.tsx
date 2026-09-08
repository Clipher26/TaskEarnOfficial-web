"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { socialApi, ReferralLandingPage, CreatorPartner, ReferralLadderEntry } from "@/api/socialApi";
import { Users, Crown, Rocket, Link2, Palette, Share2, TrendingUp, Award } from "lucide-react";

type TabType = "overview" | "landing" | "creator" | "ladder";

export default function ReferralPage() {
  const { setActiveModule } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [landingPage, setLandingPage] = useState<ReferralLandingPage | null>(null);
  const [creatorPartner, setCreatorPartner] = useState<CreatorPartner | null>(null);
  const [ladder, setLadder] = useState<ReferralLadderEntry[]>([]);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("referral");
    fetchLandingPage();
    fetchCreatorPartner();
    fetchLadder();
  }, [isLoggedIn, isLoading]);

  const fetchLandingPage = async () => {
    try {
      const data = await socialApi.getLandingPage();
      setLandingPage(data);
    } catch (error) {
      console.error("Failed to fetch landing page:", error);
    }
  };

  const fetchCreatorPartner = async () => {
    try {
      const data = await socialApi.getCreatorPartner();
      setCreatorPartner(data);
    } catch (error) {
      console.error("Failed to fetch creator partner:", error);
    }
  };

  const fetchLadder = async () => {
    try {
      const data = await socialApi.getReferralLadder("monthly");
      setLadder(data);
    } catch (error) {
      console.error("Failed to fetch ladder:", error);
    }
  };

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Referrals</h1>
              <p className="text-[10px] text-gray-400">Earn by inviting friends</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {(["overview", "landing", "creator", "ladder"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                activeTab === tab
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "landing" ? "Landing" : tab === "creator" ? "Creator" : "Ladder"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <ReferralDashboard />}

        {activeTab === "landing" && (
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Custom Referral Page</h3>
            </div>
            {landingPage ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Custom Title</p>
                  <p className="text-xs text-white">{landingPage.custom_title || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Welcome Message</p>
                  <p className="text-xs text-slate-300">{landingPage.welcome_message || "Not set"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${landingPage.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                    {landingPage.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Views</span>
                  <span className="text-xs font-bold text-white">{landingPage.views_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Conversions</span>
                  <span className="text-xs font-bold text-white">{landingPage.conversions_count}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No custom landing page created yet.</p>
            )}
          </div>
        )}

        {activeTab === "creator" && (
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Creator Partner Program</h3>
            </div>
            {creatorPartner ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Platform</p>
                  <p className="text-xs text-white">{creatorPartner.platform}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Handle</p>
                  <p className="text-xs text-white">{creatorPartner.handle}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Promo Code</p>
                  <p className="text-xs font-mono text-indigo-400">{creatorPartner.promo_code}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Revenue Share</p>
                  <p className="text-xs text-white">{creatorPartner.revenue_share_pct}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
                  <p className="text-sm font-bold text-emerald-400">${creatorPartner.total_earned_usdt.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">You haven't joined the Creator Partner Program yet.</p>
            )}
          </div>
        )}

        {activeTab === "ladder" && (
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Referral Ladder</h3>
            </div>
            {ladder.length === 0 ? (
              <p className="text-xs text-slate-400">No referrals yet this month.</p>
            ) : (
              <div className="space-y-2">
                {ladder.map((entry) => (
                  <div key={entry.user_id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        entry.rank === 1 ? "bg-amber-500 text-black" : entry.rank === 2 ? "bg-slate-400 text-black" : entry.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {entry.rank}
                      </div>
                      <span className="text-xs font-medium text-white">{entry.username}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">${entry.total_usdt.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500">{entry.referral_count} refs</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

