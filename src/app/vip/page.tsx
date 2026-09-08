"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Crown, Star, TrendingUp, Zap, Shield, Gem, Award, RefreshCw, ChevronRight, Check, X, ExternalLink } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useVipData, UserVipData } from "@/hooks/useVipData";
import { useRouter } from "next/navigation";

interface TierConfig {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  price: number;
  priceYearly: number;
  tagline: string;
  benefits: string[];
  earnings: {
    tasksPerDay: number | string;
    earnPolyGames: number | string;
    earnPolyPlays: number | string;
    earnFlipOptions: number | string;
    earnFlipFlips: number | string;
    earnClashModes: number | string;
    earnClashBattles: number | string;
    maxWin: string;
    bonusEarnings: string;
    platformFee: string;
  };
  trading: {
    markets: string;
    tradesPerDay: number | string;
    maxTradeSize: string;
    copyTrading: number | string;
    botAccess: boolean;
    autoTrading: boolean;
  };
  signals: {
    perDay: number | string;
    delay: string;
    earlyAccess: string;
  };
  withdrawals: {
    cryptoMin: string;
    cryptoFee: string;
    bankMin: string;
    bankFee: string;
    giftCards: boolean;
    processing: string;
  };
}

const VIP_TIERS: TierConfig[] = [
  {
    name: "FREE",
    minLevel: 0,
    maxLevel: 0,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    icon: Shield,
    price: 0,
    priceYearly: 0,
    tagline: "Start your earning journey",
    benefits: ["Basic tasks access", "View campaigns", "10 tasks/day", "$10 min withdrawal", "5% platform fee", "1 active campaign", "Basic signals (3/day, 1h delay)", "Paper trading only"],
    earnings: {
      tasksPerDay: 10,
      earnPolyGames: 3,
      earnPolyPlays: 3,
      earnFlipOptions: 2,
      earnFlipFlips: 5,
      earnClashModes: 1,
      earnClashBattles: 3,
      maxWin: "$1",
      bonusEarnings: "0%",
      platformFee: "5%",
    },
    trading: {
      markets: "0",
      tradesPerDay: 0,
      maxTradeSize: "$0",
      copyTrading: 0,
      botAccess: false,
      autoTrading: false,
    },
    signals: {
      perDay: 3,
      delay: "1 hour",
      earlyAccess: "None",
    },
    withdrawals: {
      cryptoMin: "$10",
      cryptoFee: "5%",
      bankMin: "₦5,000",
      bankFee: "5%",
      giftCards: false,
      processing: "24-48h",
    },
  },
  {
    name: "BRONZE",
    minLevel: 1,
    maxLevel: 10,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: Shield,
    price: 4,
    priceYearly: 40,
    tagline: "Step up your earning and trading game",
    benefits: ["25 tasks/day", "$5 min withdrawal", "4% platform fee", "3 active campaigns", "Basic analytics", "Email support (12-24h)", "5 markets access", "1 mini trade/day ($10 max)", "Copy trading (3 traders)", "10 signals/day (15m delay)", "Telegram signal notifications"],
    earnings: {
      tasksPerDay: 25,
      earnPolyGames: 5,
      earnPolyPlays: 10,
      earnFlipOptions: 3,
      earnFlipFlips: 15,
      earnClashModes: 2,
      earnClashBattles: 10,
      maxWin: "$5",
      bonusEarnings: "0%",
      platformFee: "4%",
    },
    trading: {
      markets: "5",
      tradesPerDay: 1,
      maxTradeSize: "$10",
      copyTrading: 3,
      botAccess: false,
      autoTrading: false,
    },
    signals: {
      perDay: 10,
      delay: "15 minutes",
      earlyAccess: "None",
    },
    withdrawals: {
      cryptoMin: "$5",
      cryptoFee: "4%",
      bankMin: "₦2,500",
      bankFee: "4%",
      giftCards: true,
      processing: "12-24h",
    },
  },
  {
    name: "SILVER",
    minLevel: 11,
    maxLevel: 25,
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    icon: Award,
    price: 9.99,
    priceYearly: 99.99,
    tagline: "Unlock premium earning and trading potential",
    benefits: ["Unlimited tasks", "$5 min withdrawal", "3% platform fee", "10 active campaigns", "Advanced analytics", "Priority support (6-12h)", "5% bonus earnings", "15 markets access", "5 trades/day ($25 max)", "Copy trading (10 traders)", "Limit orders", "Stop-loss & take-profit", "25 signals/day (5m delay)", "Premium signal channel", "EarnFlip full access"],
    earnings: {
      tasksPerDay: "Unlimited",
      earnPolyGames: 10,
      earnPolyPlays: 25,
      earnFlipOptions: 5,
      earnFlipFlips: 30,
      earnClashModes: 3,
      earnClashBattles: 20,
      maxWin: "$10",
      bonusEarnings: "5%",
      platformFee: "3%",
    },
    trading: {
      markets: "15",
      tradesPerDay: 5,
      maxTradeSize: "$25",
      copyTrading: 10,
      botAccess: false,
      autoTrading: false,
    },
    signals: {
      perDay: 25,
      delay: "5 minutes",
      earlyAccess: "None",
    },
    withdrawals: {
      cryptoMin: "$5",
      cryptoFee: "3%",
      bankMin: "₦1,000",
      bankFee: "3%",
      giftCards: true,
      processing: "6-12h",
    },
  },
  {
    name: "GOLD",
    minLevel: 26,
    maxLevel: 50,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Crown,
    price: 19.99,
    priceYearly: 199.99,
    tagline: "Dominate earning and trading",
    benefits: ["VIP task access (72h early)", "No withdrawal minimum", "2% platform fee", "25 active campaigns", "Premium analytics", "Priority support (2-6h)", "10% bonus earnings", "Free KYC", "50% referral bonus", "30+ markets", "15 trades/day ($100 max)", "Copy trading (25 traders)", "All order types", "Basic trading bot", "50 signals/day (real-time)", "VIP signal channel", "EarnClash basic access", "EarnPoly premium rooms"],
    earnings: {
      tasksPerDay: "Unlimited",
      earnPolyGames: 15,
      earnPolyPlays: 50,
      earnFlipOptions: 7,
      earnFlipFlips: 50,
      earnClashModes: 5,
      earnClashBattles: 40,
      maxWin: "$25",
      bonusEarnings: "10%",
      platformFee: "2%",
    },
    trading: {
      markets: "30+",
      tradesPerDay: 15,
      maxTradeSize: "$100",
      copyTrading: 25,
      botAccess: true,
      autoTrading: false,
    },
    signals: {
      perDay: 50,
      delay: "Real-time",
      earlyAccess: "None",
    },
    withdrawals: {
      cryptoMin: "$5",
      cryptoFee: "2%",
      bankMin: "₦500",
      bankFee: "2%",
      giftCards: true,
      processing: "2-6h",
    },
  },
  {
    name: "PLATINUM",
    minLevel: 51,
    maxLevel: 75,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: Gem,
    price: 29.99,
    priceYearly: 299.99,
    tagline: "Experience elite earning and trading status",
    benefits: ["Elite task access (1 week early)", "Instant withdrawals", "1.5% platform fee", "Unlimited campaigns", "Real-time analytics", "Priority support (1-2h)", "15% bonus earnings", "Dedicated account manager", "100+ markets", "50 trades/day ($500 max)", "Copy trading (100 traders)", "Auto-trading", "Advanced trading bot", "20 automated strategies", "100 signals/day (real-time + 15m early)", "Private signal channel", "EarnClash premium access", "API trading access"],
    earnings: {
      tasksPerDay: "Unlimited",
      earnPolyGames: 25,
      earnPolyPlays: 100,
      earnFlipOptions: 10,
      earnFlipFlips: 100,
      earnClashModes: 8,
      earnClashBattles: 80,
      maxWin: "$50",
      bonusEarnings: "15%",
      platformFee: "1.5%",
    },
    trading: {
      markets: "100+",
      tradesPerDay: 50,
      maxTradeSize: "$500",
      copyTrading: 100,
      botAccess: true,
      autoTrading: true,
    },
    signals: {
      perDay: 100,
      delay: "Real-time + 15m early",
      earlyAccess: "15 minutes",
    },
    withdrawals: {
      cryptoMin: "$5",
      cryptoFee: "1.5%",
      bankMin: "₦500",
      bankFee: "1.5%",
      giftCards: true,
      processing: "1-2h",
    },
  },
  {
    name: "DIAMOND",
    minLevel: 76,
    maxLevel: 90,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Star,
    price: 49.99,
    priceYearly: 499.99,
    tagline: "Join the exclusive earning and trading elite",
    benefits: ["Exclusive task access (2 weeks early)", "Instant priority withdrawals", "1% platform fee", "Enterprise analytics", "24/7 support (30 min)", "Dedicated account executive", "20% bonus earnings", "Custom API access", "500+ markets", "200 trades/day ($2,500 max)", "Copy trading (500 traders)", "Full algorithmic trading", "Enterprise trading bot", "100 automated strategies", "Unlimited signals (15m early)", "Elite private signal channel", "White-label trading", "OTC trading access"],
    earnings: {
      tasksPerDay: "Unlimited",
      earnPolyGames: 40,
      earnPolyPlays: 250,
      earnFlipOptions: 15,
      earnFlipFlips: 200,
      earnClashModes: 12,
      earnClashBattles: 150,
      maxWin: "$100",
      bonusEarnings: "20%",
      platformFee: "1%",
    },
    trading: {
      markets: "500+",
      tradesPerDay: 200,
      maxTradeSize: "$2,500",
      copyTrading: 500,
      botAccess: true,
      autoTrading: true,
    },
    signals: {
      perDay: "Unlimited",
      delay: "15m early",
      earlyAccess: "15 minutes",
    },
    withdrawals: {
      cryptoMin: "$5",
      cryptoFee: "1%",
      bankMin: "₦500",
      bankFee: "1%",
      giftCards: true,
      processing: "30m-1h",
    },
  },
  {
    name: "ELITE_TRADER",
    minLevel: 91,
    maxLevel: 999,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: Crown,
    price: 99.99,
    priceYearly: 999.99,
    tagline: "The ultimate trader's paradise",
    benefits: ["Zero platform fee", "Unlimited everything", "White-glove support (15 min)", "Executive account manager", "25% bonus earnings", "Unlimited markets", "Unlimited trades ($50,000+ max)", "Unlimited copy trading", "Full HFT capabilities", "Market-making tools", "OTC trading desk", "Dark pool access", "Unlimited signals (1h early)", "Direct analyst access", "Custom research reports", "White-label signal service", "Revenue sharing (5% referrals)", "1-on-1 mentor sessions"],
    earnings: {
      tasksPerDay: "Unlimited",
      earnPolyGames: "Unlimited",
      earnPolyPlays: "Unlimited",
      earnFlipOptions: "Unlimited",
      earnFlipFlips: 500,
      earnClashModes: "Unlimited",
      earnClashBattles: 500,
      maxWin: "$500",
      bonusEarnings: "25%",
      platformFee: "0%",
    },
    trading: {
      markets: "Unlimited",
      tradesPerDay: "Unlimited",
      maxTradeSize: "$50,000+",
      copyTrading: "Unlimited",
      botAccess: true,
      autoTrading: true,
    },
    signals: {
      perDay: "Unlimited",
      delay: "1h early",
      earlyAccess: "1 hour",
    },
    withdrawals: {
      cryptoMin: "$1",
      cryptoFee: "0.5%",
      bankMin: "₦100",
      bankFee: "0.5%",
      giftCards: true,
      processing: "Instant",
    },
  },
];

export default function VipPage() {
  const { setActiveModule, user } = useAppStore();
  const { data: vipData, loading } = useVipData(user?.id);
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("vip");
  }, [isLoggedIn, isLoading, setActiveModule]);

  const level = vipData?.currentVipLevel || 0;
  const xp = vipData?.totalXp || 0;
  const tier = vipData?.currentTier || "FREE";
  const multiplier = vipData?.currentMultiplier || 1.0;

  const currentTier = VIP_TIERS.find((t) => t.name === tier) || VIP_TIERS[0];
  const currentIndex = VIP_TIERS.findIndex((t) => t.name === tier);
  const nextTier = currentIndex < VIP_TIERS.length - 1 ? VIP_TIERS[currentIndex + 1] : null;
  const xpProgress = nextTier ? ((xp % (nextTier.minLevel * 100)) / (nextTier.minLevel * 100)) * 100 : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const FeeRateDisplay = ({ rate }: { rate: number }) => {
    if (rate === 0) return <span className="text-emerald-400 font-bold">0% (Free)</span>;
    return <span className="text-white font-bold">{(rate * 100).toFixed(2)}%</span>;
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">VIP Tiers</h1>
          <p className="text-[10px] text-slate-400">Upgrade to unlock premium earning, trading & signal features</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className={`glass-card p-6 border-2 ${currentTier.border}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl ${currentTier.bg} border ${currentTier.border} flex items-center justify-center`}>
              <currentTier.icon size={32} className={currentTier.color} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${currentTier.color}`}>{tier}</p>
              <p className="text-sm text-slate-400">Level {level}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentTier.tagline}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">XP Progress</span>
              <span className="text-xs text-slate-300">{xp.toLocaleString()} / {nextTier ? (nextTier.minLevel * 100).toLocaleString() : "MAX"}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${currentTier.bg.replace("/10", "")}`}
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] text-slate-400">Reward Multiplier</span>
              </div>
              <p className="text-lg font-bold text-white">{multiplier}x</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-[10px] text-slate-400">Trade Fee Rate</span>
              </div>
              <FeeRateDisplay rate={multiplier > 1.2 ? 0.0 : multiplier > 1.15 ? 0.001 : multiplier > 1.1 ? 0.0005 : multiplier > 1.0 ? 0.0008 : 0.001} />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">All VIP Tiers</h3>
          <div className="space-y-3">
            {VIP_TIERS.map((t) => {
              const isCurrent = t.name === tier;
              const isLocked = !isCurrent && currentIndex < VIP_TIERS.findIndex((x) => x.name === t.name);
              return (
                <div
                  key={t.name}
                  className={`
                    p-4 rounded-xl border
                    ${isCurrent ? `${t.bg} ${t.border}` : "bg-slate-950/60 border-slate-800"}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <t.icon size={18} className={t.color} />
                      <span className={`text-sm font-bold ${t.color}`}>{t.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">${t.price}/mo</span>
                      {t.priceYearly > 0 && (
                        <span className="text-[10px] text-slate-400 block">${t.priceYearly}/yr</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{t.tagline}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-slate-500">Tasks:</span> <span className="text-slate-300">{t.earnings.tasksPerDay}/day</span></div>
                    <div><span className="text-slate-500">Trades:</span> <span className="text-slate-300">{t.trading.tradesPerDay}/day</span></div>
                    <div><span className="text-slate-500">Signals:</span> <span className="text-slate-300">{t.signals.perDay}/day</span></div>
                    <div><span className="text-slate-500">Delay:</span> <span className="text-slate-300">{t.signals.delay}</span></div>
                    <div><span className="text-slate-500">Markets:</span> <span className="text-slate-300">{t.trading.markets}</span></div>
                    <div><span className="text-slate-500">Copy:</span> <span className="text-slate-300">{t.trading.copyTrading} traders</span></div>
                    <div><span className="text-slate-500">Fee:</span> <span className="text-slate-300">{t.earnings.platformFee}</span></div>
                    <div><span className="text-slate-500">Bonus:</span> <span className="text-slate-300">{t.earnings.bonusEarnings}</span></div>
                  </div>
                  {isCurrent && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
                      <Check size={12} />
                      Current Plan
                    </div>
                  )}
                  {!isCurrent && !isLocked && (
                    <button
                      onClick={() => router.push(`/vip/upgrade?tier=${t.name}`)}
                      className="mt-2 w-full py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      Upgrade <ChevronRight size={12} />
                    </button>
                  )}
                  {isLocked && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                      <X size={12} />
                      Locked
                    </div>
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
