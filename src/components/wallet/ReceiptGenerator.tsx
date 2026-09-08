"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, TransactionReceipt } from "@/api/fintechApi";
import { FileText, Download, Loader2, Calendar } from "lucide-react";

export const ReceiptGenerator: React.FC = () => {
  const { receipts, setReceipts } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [receiptType, setReceiptType] = useState("TAX");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getReceipts();
      setReceipts(data);
    } catch (err) {
      console.error("Failed to fetch receipts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) return;
    setSubmitting(true);
    try {
      const receipt = await fintechApi.createReceipt({
        receipt_type: receiptType,
        period_start: new Date(periodStart).toISOString(),
        period_end: new Date(periodEnd).toISOString(),
      });
      setReceipts([receipt, ...receipts]);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to generate receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (receipt: TransactionReceipt) => {
    if (receipt.pdf_url) {
      window.open(receipt.pdf_url, "_blank");
    } else {
      alert("Receipt PDF is still being generated");
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <FileText className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-white">Transaction Receipts</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">Receipt Type</label>
          <select
            value={receiptType}
            onChange={(e) => setReceiptType(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="TAX">Tax Verification</option>
            <option value="BANK">Bank Proof</option>
            <option value="AUDIT">Audit Report</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Period Start</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Period End</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={submitting}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          Generate Receipt
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
        </div>
      ) : receipts.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-2">No receipts generated yet</p>
      ) : (
        <div className="space-y-2">
          {receipts.map((receipt: TransactionReceipt) => (
            <div key={receipt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800">
              <div>
                <p className="text-xs font-bold text-white">{receipt.receipt_type}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(receipt.period_start).toLocaleDateString()} - {new Date(receipt.period_end).toLocaleDateString()}
                </p>
                <p className="text-[10px] text-cyan-400 font-semibold">
                  {receipt.currency} {receipt.total_amount.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(receipt)}
                className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
