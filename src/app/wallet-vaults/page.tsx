"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, SavingsVault } from "@/api/fintechApi";
import { Lock, TrendingUp, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";

type TabType = "ACTIVE" | "CLAIMED" | "EXPIRED";

export default function WalletVaultsPage() {
  const { vaults, setVaults, addActivity } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");
  const [showCreate, setShowCreate] = useState(false);
  const [amount, setAmount] = useState("");
  const [tier, setTier] = useState("SHORT_30D");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getVaults();
      setVaults(data);
    } catch (err) {
      console.error("Failed to fetch vaults", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    try {
      const vault = await fintechApi.createVault({ amount: parseFloat(amount), tier });
      setVaults([vault, ...vaults]);
      addActivity({
        id: vault.id,
        type: "quest",
        title: "Vault Created",
        description: `Locked ${vault.amount} TCoin at ${vault.apy_rate}% APY`,
        amount: vault.amount,
        timestamp: vault.created_at,
        icon: "🔒",
        color: "emerald",
      });
      setShowCreate(false);
      setAmount("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create vault");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (vaultId: string) => {
    try {
      const result = await fintechApi.claimVaultRewards(vaultId);
      await fetchVaults();
      addActivity({
        id: result.vault_id,
        type: "quest",
        title: "Vault Rewards Claimed",
        description: `Claimed ${result.reward.toFixed(4)} TCoin`,
        amount: result.reward,
        timestamp: new Date().toISOString(),
        icon: "🎁",
        color: "amber",
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to claim rewards");
    }
  };

  const filteredVaults = vaults.filter((v) => v.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Savings Vaults</h1>
            <p className="text-xs text-slate-400 mt-1">Lock TCoin and earn 8% APY</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors"
          >
            {showCreate ? "Cancel" : "New Vault"}
          </button>
        </div>

        {showCreate && (
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Amount (TCoin)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Vault Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "SHORT_30D", label: "30 Days", apy: "8%" },
                  { value: "MEDIUM_60D", label: "60 Days", apy: "8%" },
                  { value: "LONG_90D", label: "90 Days", apy: "8%" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTier(t.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      tier === t.value
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <p className="text-xs font-bold">{t.label}</p>
                    <p className="text-[10px] mt-1">{t.apy} APY</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Lock TCoin
            </button>
          </div>
        )}

        <div className="flex gap-1.5 p-1 bg-gray-950 rounded-2xl border border-gray-800 mb-6">
          {(["ACTIVE", "CLAIMED", "EXPIRED"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredVaults.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No {activeTab.toLowerCase()} vaults found
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVaults.map((vault) => (
              <div key={vault.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{vault.amount.toLocaleString()} TCoin</p>
                      <p className="text-[10px] text-gray-400">{vault.apy_rate}% APY</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                      vault.status === "LOCKED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : vault.status === "CLAIMED"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}
                  >
                    {vault.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {new Date(vault.start_date).toLocaleDateString()} - {new Date(vault.end_date).toLocaleDateString()}
                  </span>
                  {vault.status === "LOCKED" && new Date(vault.end_date) < new Date() && (
                    <button
                      onClick={() => handleClaim(vault.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
