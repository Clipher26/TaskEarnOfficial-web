"use client";

import React, { useState } from "react";
import { Upload, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { ghostTaskApi, GhostTaskProof } from "@/api/ghostTaskApi";
import { useZkTLS } from "@/hooks/useZkTLS";

interface ZkProofUploaderProps {
  taskId: string;
  targetUrl: string;
  requiredClaim: string;
  onVerified?: (proof: GhostTaskProof) => void;
}

export function ZkProofUploader({ taskId, targetUrl, requiredClaim, onVerified }: ZkProofUploaderProps) {
  const [signature, setSignature] = useState("");
  const [publicSignals, setPublicSignals] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GhostTaskProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { proof, generateProof, loading, error: zkError } = useZkTLS();

  const handleGenerateProof = async () => {
    try {
      const result = await generateProof({
        targetUrl,
        claim: requiredClaim,
        proofType: "TLS_NOTARY",
      });
      setSignature(result.signature || "");
      setPublicSignals(result.publicSignals || "");
    } catch (err) {
      // handled by hook
    }
  };

  const handleSubmit = async () => {
    if (!signature.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await ghostTaskApi.verifyProof({
        task_id: taskId,
        proof_identifier: `${taskId}-${Date.now()}`,
        proof_type: "TLS_NOTARY",
        claim_data: JSON.stringify({ claim: requiredClaim }),
        signature,
        public_signals: publicSignals || undefined,
      });
      setResult(res);
      onVerified?.(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="text-indigo-400" size={18} />
        <h3 className="text-sm font-bold text-white">zkTLS Proof Verifier</h3>
      </div>

      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target</p>
        <p className="text-xs text-white font-mono truncate">{targetUrl}</p>
        <p className="text-[10px] text-slate-400 mt-1">Claim: {requiredClaim}</p>
      </div>

      {!signature ? (
        <button
          onClick={handleGenerateProof}
          disabled={loading}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating Proof...
            </>
          ) : (
            <>
              <Shield size={14} />
              Generate zkTLS Proof
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Signature</label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Public Signals (optional)</label>
            <textarea
              value={publicSignals}
              onChange={(e) => setPublicSignals(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Verify & Submit
              </>
            )}
          </button>
        </div>
      )}

      {(zkError || error) && (
        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-[10px] text-rose-400">{zkError || error}</p>
        </div>
      )}

      {result && (
        <div className={`p-3 rounded-xl border ${result.status === "VERIFIED" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className={result.status === "VERIFIED" ? "text-emerald-400" : "text-rose-400"} />
            <p className="text-xs font-bold text-white">{result.status === "VERIFIED" ? "Proof Verified" : "Proof Rejected"}</p>
          </div>
          {result.reward_credited && (
            <p className="text-[10px] text-emerald-400">Reward credited to wallet</p>
          )}
        </div>
      )}
    </div>
  );
}
