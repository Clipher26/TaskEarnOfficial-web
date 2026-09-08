"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, AutoWithdrawalRule } from "@/api/fintechApi";
import { Plus, Trash2, Loader2 } from "lucide-react";

export const AutoWithdrawSettings: React.FC = () => {
  const { autoWithdrawRules, setAutoWithdrawRules } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [destType, setDestType] = useState("BANK");
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
    if (!threshold) return;
    setSubmitting(true);
    try {
      const rule = await fintechApi.createAutoWithdrawRule({
        trigger_type: "THRESHOLD",
        threshold_amount: parseFloat(threshold),
        currency,
        destination_type: destType,
      });
      setAutoWithdrawRules([...autoWithdrawRules, rule]);
      setShowForm(false);
      setThreshold("");
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
    <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Auto-Withdrawal Rules</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {showForm && (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Threshold ($)"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="USDT">USDT</option>
              <option value="TCOIN">TCOIN</option>
              <option value="NGN">NGN</option>
            </select>
            <select
              value={destType}
              onChange={(e) => setDestType(e.target.value)}
              className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="BANK">Bank</option>
              <option value="CRYPTO">Crypto</option>
              <option value="MOBILE">Mobile</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Rule
          </button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        </div>
      ) : autoWithdrawRules.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-2">No auto-withdrawal rules configured</p>
      ) : (
        <div className="space-y-2">
          {autoWithdrawRules.map((rule: AutoWithdrawalRule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800">
              <div>
                <p className="text-xs font-bold text-white">
                  ${rule.threshold_amount} {rule.currency} → {rule.destination_type}
                </p>
                <p className="text-[10px] text-gray-500">{rule.trigger_type}</p>
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
