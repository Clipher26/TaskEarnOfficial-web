"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileImage,
} from "lucide-react";
import { receiptApi, ReceiptImageResponse } from "@/api/receiptApi";
import { useAuth } from "@/context/AuthContext";

interface ProofOfPaymentUploaderProps {
  onUploaded?: (receipt: ReceiptImageResponse) => void;
}

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "REJECTED",
  "FAILED",
  "PENDING_ADMIN_REVIEW",
]);

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    case "REJECTED":
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-red-500/10 text-red-400 border-red-500/20">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    case "PENDING_ADMIN_REVIEW":
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Under Review
        </span>
      );
    case "PROCESSING":
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-sky-500/10 text-sky-400 border-sky-500/20">
          <Loader2 className="w-3 h-3 animate-spin" /> Processing
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-gray-500/10 text-gray-400 border-gray-500/20">
          <AlertTriangle className="w-3 h-3" /> Pending
        </span>
      );
  }
}

export const ProofOfPaymentUploader: React.FC<ProofOfPaymentUploaderProps> = ({ onUploaded }) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
    setReceipt(null);
  };

  const startPolling = useCallback(
    (receiptId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const updated = await receiptApi.getReceipt(receiptId);
          setReceipt(updated);
          if (TERMINAL_STATUSES.has(updated.status) && pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch {
          /* keep polling; backend may still be processing */
        }
      }, 3000);
    },
    []
  );

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    try {
      const data = await receiptApi.uploadReceipt(file);
      setReceipt(data.receipt);
      if (onUploaded) onUploaded(data.receipt);
      startPolling(data.receipt.id);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err?.message || "Failed to upload proof of payment."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-gray-300">Payment Receipt / Proof:</label>

      <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="proof-of-payment-upload"
        />
        <label
          htmlFor="proof-of-payment-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <FileImage className="w-7 h-7 text-gray-400" />
          <span className="text-xs text-gray-300">
            {file ? file.name : "Click to choose receipt image"}
          </span>
        </label>
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-gray-800">
          <img src={preview} alt="Receipt preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
              setReceipt(null);
            }}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-lg"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading || !token}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 text-white text-xs font-bold rounded-xl transition-all"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading to secure storage...
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" /> Upload Proof of Payment
          </>
        )}
      </button>

      {!token && (
        <p className="text-[11px] text-amber-400/90">
          You must be signed in to upload a proof of payment.
        </p>
      )}

      {receipt && (
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400">
              Receipt #{receipt.id.slice(0, 8)}
            </span>
            <StatusBadge status={receipt.status} />
          </div>

          {receipt.status === "COMPLETED" && (
            <div className="space-y-1">
              <p className="text-[10px] text-gray-300">{receipt.forensic_reasoning}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-emerald-300">
                  Confidence: {((receipt.confidence_score ?? 0) * 100).toFixed(1)}%
                </span>
                {receipt.auto_processed && (
                  <span className="text-[10px] font-mono text-emerald-300">Auto-processed</span>
                )}
                {receipt.balance_credited && (
                  <span className="text-[10px] font-mono text-emerald-300">
                    Credited: {receipt.credited_amount} {receipt.currency}
                  </span>
                )}
              </div>
              {receipt.detected_anomalies && receipt.detected_anomalies.length > 0 && (
                <ul className="list-disc list-inside text-[10px] text-red-300">
                  {receipt.detected_anomalies.map((a: any, i: number) => (
                    <li key={i}>{String(a)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {receipt.status === "REJECTED" && (
            <div className="space-y-1">
              <p className="text-[10px] text-red-300">
                {receipt.forensic_reasoning || receipt.error_log || "Receipt rejected"}
              </p>
              {receipt.admin_note && (
                <p className="text-[10px] text-gray-400">Admin: {receipt.admin_note}</p>
              )}
            </div>
          )}

          {receipt.status === "PENDING_ADMIN_REVIEW" && (
            <p className="text-[10px] text-amber-300">
              Stored securely. Awaiting manual admin review...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProofOfPaymentUploader;
