"use client";

import React, { useEffect } from "react";
import { ShieldCheck, Loader2, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useKYC, KYCStatus } from "@/hooks/useKYC";

export function KYCVerification({ onVerified }: { onVerified?: () => void }) {
  const { status, loading, error, startVerification } = useKYC();

  useEffect(() => {
    if (status?.kyc_status === "VERIFIED" && onVerified) {
      onVerified();
    }
  }, [status?.kyc_status, onVerified]);

  const handleStart = async () => {
    const session = await startVerification();
    if (session?.session_url) {
      window.open(session.session_url, "_blank", "width=800,height=700");
    }
  };

  const getBadge = (kycStatus: string) => {
    switch (kycStatus) {
      case "VERIFIED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-red-500/10 text-red-400 border-red-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-gray-500/10 text-gray-400 border-gray-500/20">
            <AlertTriangle className="w-3 h-3" /> Not Verified
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Identity Verification (KYC)</h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : status ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            {getBadge(status.kyc_status)}
          </div>

          {status.kyc_status === "VERIFIED" && (
            <p className="text-[10px] text-gray-300">
              Verified on {status.didit_verified_at ? new Date(status.didit_verified_at).toLocaleDateString() : "N/A"}
            </p>
          )}

          {status.kyc_status === "REJECTED" && status.rejection_reason && (
            <p className="text-[10px] text-red-300">Reason: {status.rejection_reason}</p>
          )}

          {(status.kyc_status === "NONE" || status.kyc_status === "REJECTED") && (
            <button
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {status.kyc_status === "REJECTED" ? "Retry Verification" : "Verify Identity"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
