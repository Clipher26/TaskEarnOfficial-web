"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { vipApi, VipTierInfo } from "@/api/vipApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown, ChevronRight, Check, Wallet, ExternalLink, Building2, X, Loader2 } from "lucide-react";

type PaymentMethod = "WALLET_BALANCE" | "EXTERNAL_CRYPTO" | "BANK_TRANSFER";

const TIER_ORDER = ["FREE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE_TRADER"];

function hasMinTier(userTier: string, minTier: string): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier);
  const minIdx = TIER_ORDER.indexOf(minTier);
  return userIdx >= minIdx;
}

export default function VipUpgradePage() {
  const { setActiveModule, user } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tiers, setTiers] = useState<VipTierInfo[]>([]);
  const [currentTier, setCurrentTier] = useState<string>("FREE");
  const [selectedTier, setSelectedTier] = useState<VipTierInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WALLET_BALANCE");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const targetTierName = (searchParams?.get("tier")?.toUpperCase() || "").trim();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("vip");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const data = await vipApi.getTiers(user.id);
        setTiers(data.available_upgrades);
        setCurrentTier(data.current_tier);
        if (targetTierName) {
          const tier = data.available_upgrades.find((t) => t.tier === targetTierName);
          if (tier) setSelectedTier(tier);
        }
      } catch (e) {
        console.error("Failed to load VIP tiers", e);
      }
    };
    load();
  }, [user?.id, targetTierName]);

  const handleUpgrade = async () => {
    if (!selectedTier || !user?.id) return;
    setProcessing(true);
    setMessage(null);
    try {
      const res = await vipApi.upgradeTier(
        { target_tier: selectedTier.tier, payment_method: paymentMethod },
        user.id
      );
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Upgrade successful!" });
        setTimeout(() => router.push("/vip"), 2000);
      } else {
        setMessage({ type: "error", text: res.message || "Upgrade failed" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.response?.data?.detail || "Upgrade failed. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentIdx = TIER_ORDER.indexOf(currentTier);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={18} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Upgrade VIP</h1>
            <p className="text-[10px] text-slate-400">Choose your tier and payment method</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {message && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Select Tier</h3>
          <div className="space-y-2">
            {tiers.map((t) => {
              const tierIdx = TIER_ORDER.indexOf(t.tier);
              const isLocked = tierIdx > currentIdx + 1;
              const isSelected = selectedTier?.tier === t.tier;
              return (
                <button
                  key={t.tier}
                  disabled={isLocked}
                  onClick={() => setSelectedTier(t)}
                  className={`
                    w-full p-3 rounded-xl border text-left transition-all
                    ${isSelected ? "bg-indigo-500/10 border-indigo-500/30" : "bg-slate-950/60 border-slate-800"}
                    ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-500/30"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{t.tier}</span>
                      <span className="text-[10px] text-slate-400 block">${t.price_usdt}/mo</span>
                    </div>
                    {isSelected && <Check size={16} className="text-indigo-400" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                    <div><span className="text-slate-500">Trades:</span> <span className="text-slate-300">{t.max_trades_per_day}/day</span></div>
                    <div><span className="text-slate-500">Size:</span> <span className="text-slate-300">${t.max_trade_size}</span></div>
                    <div><span className="text-slate-500">Signals:</span> <span className="text-slate-300">{t.signals_per_day}/day</span></div>
                    <div><span className="text-slate-500">Delay:</span> <span className="text-slate-300">{t.signal_delay}</span></div>
                    <div><span className="text-slate-500">Markets:</span> <span className="text-slate-300">{t.markets_access}</span></div>
                    <div><span className="text-slate-500">Copy:</span> <span className="text-slate-300">{t.copy_trading_traders} traders</span></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedTier && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { id: "WALLET_BALANCE" as PaymentMethod, label: "Wallet Balance", icon: Wallet, desc: "Pay from your USDT wallet" },
                { id: "EXTERNAL_CRYPTO" as PaymentMethod, label: "External Crypto", icon: ExternalLink, desc: "Send crypto to our address" },
                { id: "BANK_TRANSFER" as PaymentMethod, label: "Bank Transfer", icon: Building2, desc: "NGN bank transfer" },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`
                    w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3
                    ${paymentMethod === pm.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-slate-950/60 border-slate-800 hover:border-indigo-500/30"}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === pm.id ? "bg-indigo-500/20" : "bg-slate-800"}`}>
                    <pm.icon size={18} className={paymentMethod === pm.id ? "text-indigo-400" : "text-slate-400"} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{pm.label}</span>
                    <span className="text-[10px] text-slate-400">{pm.desc}</span>
                  </div>
                  {paymentMethod === pm.id && <Check size={16} className="text-indigo-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTier && (
          <button
            onClick={handleUpgrade}
            disabled={processing}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown size={16} />
                Upgrade to {selectedTier.tier} - ${selectedTier.price_usdt}/mo
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
