"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { offerwallApi, OfferwallOffer } from "@/api/offerwallApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DollarSign, Star, Users, Zap, TrendingUp, Award, ExternalLink, CheckCircle2, Clock, Filter } from "lucide-react";

type OfferCategory = "ALL" | "CPI" | "CPA" | "SURVEY" | "APP_TESTING";

export default function OfferwallPage() {
  const { setActiveModule, wallet } = useAppStore();
  const { isLoggedIn, isLoading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<OfferwallOffer[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<OfferwallOffer[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<OfferCategory>("ALL");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [lastOfferRefresh, setLastOfferRefresh] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) return;
    setActiveModule("offerwall");
  }, [isLoggedIn, authLoading]);

  const fetchData = useCallback(async () => {
    try {
      const [offersData, featuredData, conversionsData] = await Promise.all([
        offerwallApi.getOffers("ALL", activeCategory === "ALL" ? undefined : activeCategory),
        offerwallApi.getFeaturedOffers(5),
        offerwallApi.getConversions(20),
      ]);
      setOffers(offersData.offers);
      setFeaturedOffers(featuredData.offers);
      setConversions(conversionsData.conversions);
    } catch (error) {
      console.error("Failed to fetch offerwall data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [fetchData, isLoggedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastOfferRefresh) {
        setLastOfferRefresh(today);
        fetchData();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastOfferRefresh, fetchData]);

  const handleCompleteOffer = async (offerId: string) => {
    setCompletingId(offerId);
    try {
      const result = await offerwallApi.completeOffer(offerId);
      setShowSuccess(result.conversion.offer_title);
      setTimeout(() => setShowSuccess(null), 3000);
      const updatedConversions = await offerwallApi.getConversions(20);
      setConversions(updatedConversions.conversions);
    } catch (error) {
      console.error("Failed to complete offer:", error);
      alert("Failed to complete offer. Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  const categories: { id: OfferCategory; label: string; icon: React.ReactNode }[] = [
    { id: "ALL", label: "All", icon: <TrendingUp size={14} /> },
    { id: "CPA", label: "CPA", icon: <DollarSign size={14} /> },
    { id: "CPI", label: "CPI", icon: <Users size={14} /> },
    { id: "SURVEY", label: "Surveys", icon: <Star size={14} /> },
    { id: "APP_TESTING", label: "Apps", icon: <Zap size={14} /> },
  ];

  const totalEarnedUsdt = conversions.reduce((sum, c) => sum + c.payout_usd, 0);
  const totalEarnedTcoin = conversions.reduce((sum, c) => sum + c.tcoin_awarded, 0);

  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-white">Offerwall</h1>
              <p className="text-[10px] text-slate-400">Complete offers, earn rewards</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <DollarSign size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">${totalEarnedUsdt.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                <Star size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">{totalEarnedTcoin.toFixed(0)} TCOIN</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap
                  ${activeCategory === cat.id
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-300"
                  }
                `}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {showSuccess && (
          <div className="glass-card p-3 flex items-center gap-2 border-emerald-500/30">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <p className="text-xs text-emerald-400 font-medium">Offer completed: {showSuccess}</p>
          </div>
        )}

        {featuredOffers.length > 0 && activeCategory === "ALL" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-amber-400" />
              <h2 className="text-sm font-bold text-white">Featured Offers</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {featuredOffers.map((offer) => (
                <div key={offer.id} className="glass-card p-3 min-w-[260px] border-amber-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-white mb-1">{offer.title}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{offer.description}</p>
                    </div>
                    <span className="ml-2 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded border border-amber-500/20">
                      {offer.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <DollarSign size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400">${offer.payout_usd.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Star size={10} className="text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">+{offer.tcoin_reward.toFixed(0)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteOffer(offer.id)}
                      disabled={completingId === offer.id}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-[10px] font-bold rounded-lg disabled:opacity-50"
                    >
                      {completingId === offer.id ? "..." : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              {activeCategory === "ALL" ? "All Offers" : `${activeCategory} Offers`}
            </h2>
            <span className="text-[10px] text-slate-500">({offers.length})</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <Filter size={48} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No offers available in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded border border-slate-700">
                          {offer.category}
                        </span>
                        {offer.is_featured && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded border border-amber-500/20">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{offer.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{offer.description}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Users size={10} />
                        <span>{offer.advertiser_name}</span>
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <DollarSign size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400">${offer.payout_usd.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Star size={10} className="text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">+{offer.tcoin_reward.toFixed(0)} TCOIN</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        {offer.conversions} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {offer.country}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCompleteOffer(offer.id)}
                      disabled={completingId === offer.id}
                      className="flex items-center gap-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl disabled:opacity-50"
                    >
                      <ExternalLink size={12} />
                      {completingId === offer.id ? "Completing..." : "Complete Offer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {conversions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-slate-400" />
              <h2 className="text-sm font-bold text-white">Recent Completions</h2>
            </div>
            <div className="space-y-2">
              {conversions.map((conv) => (
                <div key={conv.id} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white line-clamp-1">{conv.offer_title}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      conv.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {conv.status}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      +${conv.payout_usd.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
