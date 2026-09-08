"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, GiftCardRedemption } from "@/api/fintechApi";
import { Gift, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

const PROVIDERS = [
  { id: "AMAZON", name: "Amazon", color: "amber" },
  { id: "GOOGLE_PLAY", name: "Google Play", color: "emerald" },
  { id: "STEAM", name: "Steam", color: "slate" },
  { id: "APPLE", name: "Apple", color: "rose" },
];

const DENOMINATIONS: Record<string, number[]> = {
  AMAZON: [5, 10, 25, 50, 100],
  GOOGLE_PLAY: [5, 10, 25, 50],
  STEAM: [5, 10, 20, 50],
  APPLE: [10, 25, 50, 100],
};

export default function GiftCardsPage() {
  const { giftCards, setGiftCards } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("AMAZON");
  const [selectedDenom, setSelectedDenom] = useState(5);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getGiftCards();
      setGiftCards(data);
    } catch (err) {
      console.error("Failed to fetch gift cards", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedProvider) return;
    setSubmitting(true);
    try {
      const redemption = await fintechApi.redeemGiftCard({
        provider: selectedProvider,
        amount_usdt: selectedDenom,
        denomination: `${selectedDenom}`,
        recipient_email: email || undefined,
      });
      setGiftCards([redemption, ...giftCards]);
      setEmail("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to redeem gift card");
    } finally {
      setSubmitting(false);
    }
  };

  const providerColors: Record<string, string> = {
    AMAZON: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    GOOGLE_PLAY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    STEAM: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    APPLE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-5">
        <h1 className="text-2xl font-extrabold text-white mb-1">Gift Cards</h1>
        <p className="text-xs text-slate-400 mb-6">Redeem earnings for instant digital gift cards</p>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-3">Select Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProvider(p.id);
                    setSelectedDenom(DENOMINATIONS[p.id][0]);
                  }}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedProvider === p.id
                      ? providerColors[p.id] + " border-current"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Denomination</label>
            <div className="grid grid-cols-4 gap-2">
              {DENOMINATIONS[selectedProvider]?.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDenom(d)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedDenom === d
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Delivery Email (optional)</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleRedeem}
            disabled={submitting}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Gift className="w-4 h-4" />
            )}
            Redeem ${selectedDenom} Gift Card
          </button>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">Redemption History</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : giftCards.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No gift card redemptions yet</div>
        ) : (
          <div className="space-y-3">
            {giftCards.map((card: GiftCardRedemption) => (
              <div key={card.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${providerColors[card.provider] || providerColors.AMAZON}`}>
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{card.provider}</p>
                      <p className="text-[10px] text-gray-400">${card.amount_usdt} • {card.denomination}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                      card.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : card.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                {card.delivery_url && (
                  <a
                    href={card.delivery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Gift Card
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
