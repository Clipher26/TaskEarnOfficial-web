"use client";

import React, { useState, useCallback } from "react";
import { Upload, Shield, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReceiptRealtime, ReceiptStatus } from "@/hooks/useReceiptRealtime";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function ReceiptUploader() {
  const { token, user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { receipt, loading } = useReceiptRealtime(receiptId);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setError(null);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!preview || !token || !user) return;

    setUploading(true);
    setError(null);

    try {
      const blob = await fetch(preview).then((r) => r.blob());
      const file = new File([blob], "receipt.jpg", { type: blob.type });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/v1/receipts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      const data = await res.json();
      if (data.receipt?.id) {
        setReceiptId(data.receipt.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [preview, token, user]);

  const getStatusBadge = (status: string) => {
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
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20">
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
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Deposit Receipt Scanner</h3>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload"
          />
          <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-300">Click to upload deposit receipt</span>
          </label>
        </div>

        {preview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-800">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!preview || uploading || !token}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-400 text-white text-sm font-bold rounded-xl transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" /> Scan Receipt
            </>
          )}
        </button>

        {(receipt || loading) && (
          <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400">
                {receipt?.id?.slice(0, 8)}...
              </span>
              {receipt && getStatusBadge(receipt.status)}
            </div>

            {receipt?.status === "COMPLETED" && (
              <div className="space-y-1">
                <p className="text-[10px] text-gray-300">{receipt.forensic_reasoning}</p>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono text-indigo-300">
                    Confidence: {((receipt.confidence_score ?? 0) * 100).toFixed(1)}%
                  </span>
                  {receipt.auto_processed && (
                    <span className="text-[10px] font-mono text-emerald-300">Auto-processed</span>
                  )}
                </div>
                {receipt.detected_anomalies && receipt.detected_anomalies.length > 0 && (
                  <ul className="list-disc list-inside text-[10px] text-red-300">
                    {receipt.detected_anomalies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
                {receipt.balance_credited && (
                  <p className="text-[10px] font-mono text-emerald-300">
                    Credited: {receipt.credited_amount} {receipt.currency}
                  </p>
                )}
                {receipt.extracted_metadata && (
                  <pre className="text-[10px] font-mono text-gray-400 bg-black/30 p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify(receipt.extracted_metadata, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {receipt?.status === "REJECTED" && (
              <div className="space-y-1">
                <p className="text-[10px] text-red-300">{receipt.forensic_reasoning || receipt.error_log || "Receipt rejected"}</p>
                {receipt.admin_note && (
                  <p className="text-[10px] text-gray-400">Admin: {receipt.admin_note}</p>
                )}
              </div>
            )}

            {receipt?.status === "PENDING_ADMIN_REVIEW" && (
              <p className="text-[10px] text-amber-300">Awaiting manual review by admin...</p>
            )}

            {loading && (
              <div className="text-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
