"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, Users, Wallet, TrendingUp, Award } from "lucide-react";
import { ReferralStats } from "@/components/referral/ReferralStats";
import { ReferralTeam } from "@/components/referral/ReferralTeam";
import { referralApi, ReferralStats as ReferralStatsType, ReferralTeamMember, ReferralEarning, ReferralCommission } from "@/api/referralApi";
import { getTelegramUser } from "@/lib/telegram";

type TabType = "OVERVIEW" | "TEAM" | "EARNINGS" | "COMMISSIONS";

export const ReferralDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState<ReferralStatsType | null>(null);
  const [team, setTeam] = useState<ReferralTeamMember[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const tgUser = getTelegramUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codeRes, statsRes, teamRes, earningsRes, commissionsRes] = await Promise.all([
          referralApi.getReferralCode(),
          referralApi.getReferralStats(),
          referralApi.getReferralTeam(),
          referralApi.getReferralEarnings(),
          referralApi.getReferralCommissions(),
        ]);

        setReferralCode(codeRes.referral_code);
        setReferralLink(codeRes.referral_link);
        setStats(statsRes);
        setTeam(teamRes.team);
        setEarnings(earningsRes.earnings);
        setCommissions(commissionsRes.commissions);
      } catch (error) {
        console.error("Failed to fetch referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Referral Code Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600/20 via-teal-500/10 to-emerald-600/20 border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 blur-xl" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Share2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Your Referral Code</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-950/60 border border-gray-800 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Code</p>
              <p className="text-sm font-bold text-white font-mono">{referralCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className={`p-3 rounded-xl border transition-all active:scale-95 ${
                copied
                  ? "bg-emerald-500 border-emerald-400 text-black"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
            </button>
          </div>

          <div className="p-3 bg-gray-950/60 border border-gray-800 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Referral Link</p>
            <p className="text-xs text-gray-300 font-mono truncate">{referralLink}</p>
          </div>

          <div className="flex gap-2 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span>10% First Deposit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex p-1 bg-gray-950 rounded-xl border border-gray-800">
        {(["OVERVIEW", "TEAM", "EARNINGS", "COMMISSIONS"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "OVERVIEW" && stats && (
        <ReferralStats stats={stats} />
      )}

      {activeTab === "TEAM" && <ReferralTeam team={team} />}

      {activeTab === "EARNINGS" && (
        <div className="space-y-2">
          {earnings.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No earnings yet</p>
          ) : (
            earnings.map((earning) => (
              <div
                key={earning.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Wallet size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{earning.referee_name}</p>
                    <p className="text-[10px] text-gray-500">{earning.fee_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+${earning.amount_usdt.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-500">+{earning.tcoin_awarded.toFixed(0)} TC</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "COMMISSIONS" && (
        <div className="space-y-2">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-[10px] text-amber-300 font-bold">
              FIRST-DEPOSIT COMMISSION
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Earn 10% of the first deposit amount for every user you bring. Commission is paid once per referee on their first approved deposit.
            </p>
          </div>
          {commissions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No first-deposit commissions yet</p>
          ) : (
            commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Users size={14} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{commission.referee_name}</p>
                    <p className="text-[10px] text-gray-500">
                      First deposit: {commission.deposit_amount} {commission.deposit_currency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rose-400">+${commission.amount_usdt.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(commission.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
