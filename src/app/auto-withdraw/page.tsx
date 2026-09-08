"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, AutoWithdrawalRule } from "@/api/fintechApi";
import { Plus, Trash2, CheckCircle2, XCircle, Loader2, Settings2 } from "lucide-react";

export default function AutoWithdrawPage() {
  const { autoWithdrawRules, setAutoWithdrawRules } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [triggerType, setTriggerType] = useState("THRESHOLD");
  const [threshold, setThreshold] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [destType, setDestType] = useState("BANK");
  const [destDetails, setDestDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getAutoWithdrawRules();
      setAutoWithdrawRules(data);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!destType) return;
    setSubmitting(true);
    try {
      const rule = await fintechApi.createAutoWithdrawRule({
        trigger_type: triggerType,
        threshold_amount: triggerType === "THRESHOLD" ? parseFloat(threshold) : undefined,
        currency,
        destination_type: destType,
        destination_details: destDetails || undefined,
      });
      setAutoWithdrawRules([...autoWithdrawRules, rule]);
      setShowCreate(false);
      setThreshold("");
      setDestDetails("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await fintechApi.deleteAutoWithdrawRule(ruleId);
      setAutoWithdrawRules(autoWithdrawRules.filter((r) => r.id !== ruleId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete rule");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Auto-Withdraw Rules</h1>
            <p className="text-xs text-slate-400 mt-1">Automate payouts when conditions are met</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl transition-colors"
          >
            {showCreate ? "Cancel" : "New Rule"}
          </button>
        </div>

        {showCreate && (
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Trigger Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["THRESHOLD", "SCHEDULED"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTriggerType(t)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      triggerType === t
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {t === "THRESHOLD" ? "Balance Hits $X" : "Scheduled"}
                  </button>
                ))}
              </div>
            </div>
            {triggerType === "THRESHOLD" && (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Threshold Amount</label>
                <input
                  type="number"
                  placeholder="10.00"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Currency</label>
              <div className="grid grid-cols-3 gap-2">
                {["USDT", "TCOIN", "NGN"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      currency === c
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Destination Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["BANK", "CRYPTO", "MOBILE"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDestType(d)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      destType === d
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {d === "BANK" ? "Bank Transfer" : d === "CRYPTO" ? "Crypto Wallet" : "Mobile Top-up"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Destination Details</label>
              <input
                type="text"
                placeholder="Account number, wallet address, or phone"
                value={destDetails}
                onChange={(e) => setDestDetails(e.target.value)}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Rule
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : autoWithdrawRules.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            No auto-withdrawal rules yet
          </div>
        ) : (
          <div className="space-y-3">
            {autoWithdrawRules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {rule.trigger_type} - {rule.currency}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {rule.threshold_amount ? `$${rule.threshold_amount}` : "No threshold"} → {rule.destination_type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {rule.destination_details && (
                  <p className="text-[10px] text-gray-500 ml-10 truncate">{rule.destination_details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
