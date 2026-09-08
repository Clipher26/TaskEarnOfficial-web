"use client";

import React, { useState, useEffect } from "react";
import { FlaskConical, Plus, BarChart3, CheckCircle2, XCircle, Clock } from "lucide-react";
import { securityApi, ABTest } from "@/api/securityApi";

interface ABTestPanelProps {
  campaignId?: string;
}

export function ABTestPanel({ campaignId }: ABTestPanelProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getABTests(campaignId);
      setTests(data);
    } catch (err) {
      console.error("Failed to load A/B tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [campaignId]);

  const handleCreate = async () => {
    if (!variantA.trim() || !variantB.trim()) return;
    setCreating(true);
    try {
      if (!campaignId) throw new Error("No campaign selected");
      await securityApi.createABTest({
        campaign_id: campaignId,
        variant_a_title: variantA,
        variant_b_title: variantB,
      });
      setVariantA("");
      setVariantB("");
      setShowCreate(false);
      loadTests();
    } catch (err) {
      console.error("Failed to create A/B test:", err);
    } finally {
      setCreating(false);
    }
  };

  const activeTests = tests.filter((t) => t.status === "ACTIVE");
  const completedTests = tests.filter((t) => t.status !== "ACTIVE");

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">A/B Testing</h3>
        </div>
        {campaignId && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-lg transition-all"
          >
            <Plus className="w-3 h-3" /> New Test
          </button>
        )}
      </div>

      {showCreate && campaignId && (
        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl mb-4 space-y-3">
          <div>
            <label className="text-[10px] text-gray-400 font-medium mb-1 block">Variant A (Headline)</label>
            <input
              type="text"
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              placeholder="Original headline..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-medium mb-1 block">Variant B (Headline)</label>
            <input
              type="text"
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              placeholder="Alternative headline..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Start A/B Test"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-500 text-xs">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-xs">No A/B tests found</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activeTests.length > 0 && (
            <div className="space-y-2">
              {activeTests.map((test) => (
                <div key={test.id} className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-purple-400">ACTIVE</span>
                    <span className="text-[10px] text-gray-500">{new Date(test.started_at).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">A: {test.variant_a_title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">B: {test.variant_b_title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {completedTests.length > 0 && (
            <div className="space-y-2">
              {completedTests.map((test) => (
                <div key={test.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                      test.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>{test.status}</span>
                    {test.winner_variant && (
                      <span className="text-[10px] text-purple-400 font-mono">Winner: {test.winner_variant}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">A: {test.variant_a_title}</p>
                  <p className="text-xs text-gray-400">B: {test.variant_b_title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
