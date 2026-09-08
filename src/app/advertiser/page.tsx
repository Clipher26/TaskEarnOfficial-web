"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, DollarSign, FlaskConical, MapPin, Send, Star } from "lucide-react";
import { securityApi, AdvertiserAutoTopUp, AdvertiserBadge, ABTest, GeoTarget, WebhookTest } from "@/api/securityApi";

function AdvertiserContent() {
  const searchParams = useSearchParams();
  const advertiserId = searchParams?.get("advertiser_id") || "";
  const [autoTopUp, setAutoTopUp] = useState<AdvertiserAutoTopUp | null>(null);
  const [badges, setBadges] = useState<AdvertiserBadge[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [geoTargets, setGeoTargets] = useState<GeoTarget[]>([]);
  const [webhookTests, setWebhookTests] = useState<WebhookTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"auto-topup" | "badges" | "abtest" | "geo" | "webhook">("auto-topup");

  const loadData = async () => {
    if (!advertiserId) return;
    setLoading(true);
    try {
      const [topUp, badgeData, tests, geo, wTests] = await Promise.all([
        securityApi.getAutoTopUp(advertiserId).catch(() => null),
        securityApi.getAdvertiserBadges(advertiserId),
        securityApi.getABTests(),
        securityApi.getGeoTargets("").catch(() => []),
        securityApi.getWebhookTests(advertiserId, 20, 0),
      ]);
      setAutoTopUp(topUp);
      setBadges(badgeData);
      setABTests(tests);
      setGeoTargets(geo);
      setWebhookTests(wTests);
    } catch (err) {
      console.error("Failed to load advertiser features:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [advertiserId]);

  const badgeIcons: Record<string, string> = {
    FAST_PAYER: "Fast Payer",
    HIGH_ACCEPTANCE: "100% Acceptance Rate",
    TRUSTED: "Trusted Advertiser",
    TOP_EARNER: "Top Earner",
    VERIFIED: "Verified",
  };

  const badgeColors: Record<string, string> = {
    FAST_PAYER: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    HIGH_ACCEPTANCE: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    TRUSTED: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    TOP_EARNER: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    VERIFIED: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  };

  if (!advertiserId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Shield className="w-12 h-12 text-gray-600" />
        <p className="text-sm text-gray-400">No advertiser ID provided</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-emerald-400" />
        <h1 className="text-lg font-bold text-white">Advertiser Tools</h1>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {(["auto-topup", "badges", "abtest", "geo", "webhook"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab === "auto-topup" ? "Auto-Topup" : tab === "badges" ? "Badges" : tab === "abtest" ? "A/B Tests" : tab === "geo" ? "Geo Target" : "Webhook Tester"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === "auto-topup" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Auto-Top-Up</h3>
              </div>
              {autoTopUp ? (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Active</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono">{autoTopUp.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Threshold</p>
                      <p className="text-xs font-bold text-white">${autoTopUp.threshold_usd}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Top-up Amount</p>
                      <p className="text-xs font-bold text-white">${autoTopUp.top_up_amount_usd}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Total Top-ups</p>
                      <p className="text-xs font-bold text-white">{autoTopUp.total_top_ups}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Total Topped Up</p>
                      <p className="text-xs font-bold text-emerald-400">${autoTopUp.total_topped_up_usd.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => { await securityApi.triggerAutoTopUp(advertiserId); loadData(); }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black text-xs font-bold rounded-xl"
                  >
                    Trigger Top-Up Now
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">No auto-topup configured. Set up automatic campaign funding.</p>
                  <button
                    onClick={async () => { await securityApi.createAutoTopUp({ advertiser_id: advertiserId }); loadData(); }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black text-xs font-bold rounded-xl"
                  >
                    Enable Auto-Topup
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "badges" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Performance Badges</h3>
              </div>
              {badges.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No badges awarded yet. Complete campaigns to earn badges.</p>
              ) : (
                <div className="space-y-2">
                  {badges.map((badge) => (
                    <div key={badge.id} className={`p-3 border rounded-xl ${badgeColors[badge.badge_type] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      <span className="text-xs font-bold">{badge.description || badgeIcons[badge.badge_type] || badge.badge_type}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={async () => { await securityApi.evaluateAdvertiserBadges(advertiserId); loadData(); }}
                className="w-full py-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all"
              >
                Re-evaluate Badges
              </button>
            </div>
          )}

          {activeTab === "abtest" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">A/B Tests</h3>
              </div>
              {abTests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No A/B tests found. Create one to test campaign headlines.</p>
              ) : (
                <div className="space-y-2">
                  {abTests.map((test) => (
                    <div key={test.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          test.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          test.status === "COMPLETED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>{test.status}</span>
                        {test.winner_variant && (
                          <span className="text-[10px] text-purple-400 font-mono">Winner: {test.winner_variant}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300">A: {test.variant_a_title}</p>
                      <p className="text-xs text-gray-300">B: {test.variant_b_title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "geo" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Geo Targets</h3>
              </div>
              {geoTargets.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No geo targets configured.</p>
              ) : (
                <div className="space-y-2">
                  {geoTargets.map((gt) => (
                    <div key={gt.id} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400">{gt.target_type}:</span>
                        <span className="text-xs text-white ml-1">{gt.target_value}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        gt.is_exclusion ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>{gt.is_exclusion ? "Exclude" : "Include"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "webhook" && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Webhook Tester</h3>
              </div>
              {webhookTests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No webhook tests yet.</p>
              ) : (
                <div className="space-y-2">
                  {webhookTests.map((test) => (
                    <div key={test.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-gray-400">{test.test_event}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          test.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          test.status === "FAILED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>{test.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">{test.response_status || "N/A"}</span>
                        {test.error_message && <span className="text-[10px] text-red-400 line-clamp-1">{test.error_message}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdvertiserPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AdvertiserContent />
    </Suspense>
  );
}

export default AdvertiserPage;
