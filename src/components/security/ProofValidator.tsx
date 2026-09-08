"use client";

import React, { useState, useEffect } from "react";
import { Shield, Eye, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { securityApi, ProofValidation } from "@/api/securityApi";

export function ProofValidator() {
  const [validations, setValidations] = useState<ProofValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const loadValidations = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getProofValidations(undefined, 50, 0);
      setValidations(data);
    } catch (err) {
      console.error("Failed to load proof validations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const handleReview = async (validationId: string, humanStatus: string) => {
    try {
      await securityApi.reviewProof(validationId, humanStatus, "Reviewed by admin");
      loadValidations();
    } catch (err) {
      console.error("Failed to review proof:", err);
    }
  };

  const filtered = filter === "ALL" ? validations : validations.filter((v) => v.ai_status === filter);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">AI Proof Validator</h3>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-xs">Loading validations...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-xs">No proof validations found</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((validation) => (
            <div key={validation.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-400">{validation.id.slice(0, 8)}...</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    validation.ai_status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    validation.ai_status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    validation.ai_status === "NEEDS_REVIEW" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  }`}>{validation.ai_status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-mono ${validation.ai_risk_score && validation.ai_risk_score > 50 ? "text-red-400" : "text-emerald-400"}`}>
                    Risk: {validation.ai_risk_score?.toFixed(1) || "N/A"}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mb-2">{validation.ai_feedback}</p>
              {validation.ai_status !== "PENDING" && !validation.human_status && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(validation.id, "APPROVED")}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleReview(validation.id, "REJECTED")}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition-all"
                  >
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
              {validation.human_status && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  validation.human_status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>Human: {validation.human_status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
