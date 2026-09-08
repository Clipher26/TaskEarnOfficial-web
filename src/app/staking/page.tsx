"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Lock, Unlock, TrendingUp, Clock, Wallet, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { fintechApi, SavingsVault } from "@/api/fintechApi";

const STAKING_TIERS = [
  { id: "SHORT_30D", label: "30 Days", days: 30, apy: 5, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "MEDIUM_60D", label: "60 Days", days: 60, apy: 8, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "LONG_90D", label: "90 Days", days: 90, apy: 12, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export default function StakingPage() {
  const { setActiveModule, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<"stake" | "vaults">("stake");
  const [selectedAsset, setSelectedAsset] = useState<"TCOIN" | "CRED">("TCOIN");
  const [selectedTier, setSelectedTier] = useState("SHORT_30D");
  const [amount, setAmount] = useState("");
  const [vaults, setVaults] = useState<SavingsVault[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("staking");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchVaults = async () => {
      setLoading(true);
      try {
        const data = await fintechApi.getVaults();
        setVaults(data);
      } catch (error) {
        console.error("Failed to fetch vaults:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVaults();
  }, []);

  const tierConfig = STAKING_TIERS.find((t) => t.id === selectedTier);
  const projectedReward = amount ? Math.round(parseFloat(amount) * (tierConfig?.apy || 0) / 100 * 100) / 100 : 0;

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      await fintechApi.createVault({
        amount: parseFloat(amount),
        tier: selectedTier,
        apy_rate: tierConfig?.apy || 0,
      });
      setAmount("");
      const data = await fintechApi.getVaults();
      setVaults(data);
    } catch (error) {
      console.error("Failed to stake:", error);
    }
  };

  const handleClaim = async (vaultId: string) => {
    try {
      await fintechApi.claimVaultRewards(vaultId);
      const data = await fintechApi.getVaults();
      setVaults(data);
    } catch (error) {
      console.error("Failed to claim:", error);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Staking Vaults</h1>
          <p className="text-[10px] text-slate-400">Lock Tcoin & CRED to earn up to 12% APY</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {(["stake", "vaults"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium transition-all
                ${activeTab === tab
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-300"
                }
              `}
            >
              {tab === "stake" ? "New Stake" : "My Vaults"}
            </button>
          ))}
        </div>

        {activeTab === "stake" && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Select Asset</h3>
              <div className="flex gap-2">
                {(["TCOIN", "CRED"] as const).map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAsset(asset)}
                    className={`
                      flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border
                      ${selectedAsset === asset
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                      }
                    `}
                  >
                    {asset}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Wallet size={14} />
                <span>Balance: {selectedAsset === "TCOIN" ? "0.42" : "1,250"} {selectedAsset}</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Staking Tier</h3>
              <div className="space-y-2">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`
                      w-full p-3 rounded-xl border text-left transition-all
                      ${selectedTier === tier.id
                        ? `${tier.bg} ${tier.border}`
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{tier.label}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-slate-500" />
                          <span className="text-[10px] text-slate-400">{tier.days} days</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${tier.color}`}>{tier.apy}%</p>
                        <p className="text-[10px] text-slate-400">APY</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Stake Amount</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-lg text-white font-mono focus:outline-none focus:border-indigo-500 mb-3"
              />
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Projected Reward</span>
                    <span className="text-sm font-bold text-emerald-400">+{projectedReward.toFixed(2)} {selectedAsset}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Return</span>
                    <span className="text-sm font-bold text-white">
                      {(parseFloat(amount) + projectedReward).toFixed(2)} {selectedAsset}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleStake}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full mt-3 py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Stake Now
              </button>
            </div>
          </div>
        )}

        {activeTab === "vaults" && (
          <div className="space-y-3">
            {vaults.length === 0 ? (
              <div className="text-center py-12">
                <Lock size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No active vaults.</p>
              </div>
            ) : (
              vaults.map((vault) => {
                const tierConfig = STAKING_TIERS.find((t) => t.id === selectedTier);
                const isMature = new Date() >= new Date(vault.end_date);
                const isClaimed = vault.status === "CLAIMED";
                return (
                  <div key={vault.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${tierConfig?.bg} ${tierConfig?.border} border`}>
                          <Lock size={16} className={tierConfig?.color} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{selectedAsset}</p>
                          <p className="text-[10px] text-slate-400">{tierConfig?.label} • {vault.apy_rate}% APY</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{vault.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">
                          {isMature ? "Mature" : `Ends ${new Date(vault.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {isMature && !isClaimed && (
                      <button
                        onClick={() => handleClaim(vault.id)}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black text-xs font-bold rounded-xl"
                      >
                        <Unlock size={14} className="inline mr-1" />
                        Claim & Unlock
                      </button>
                    )}
                    {isClaimed && (
                      <div className="w-full py-2.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl text-center">
                        Claimed
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
