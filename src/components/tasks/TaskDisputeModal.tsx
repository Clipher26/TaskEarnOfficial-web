"use client";

import React, { useState } from "react";
import { X, Upload, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { TaskDispute } from "@/lib/types";

interface TaskDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, evidenceUrls: string[]) => Promise<void>;
  existingDisputes?: TaskDispute[];
}

export const TaskDisputeModal: React.FC<TaskDisputeModalProps> = ({ isOpen, onClose, onSubmit, existingDisputes = [] }) => {
  const [reason, setReason] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvidence, setNewEvidence] = useState("");

  if (!isOpen) return null;

  const addEvidence = () => {
    if (newEvidence.trim()) {
      setEvidenceUrls((prev) => [...prev, newEvidence.trim()]);
      setNewEvidence("");
    }
  };

  const removeEvidence = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.length < 10) return;
    setIsSubmitting(true);
    try {
      await onSubmit(reason, evidenceUrls);
      setReason("");
      setEvidenceUrls([]);
      onClose();
    } catch (error) {
      console.error("Failed to submit dispute:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Clock size={14} className="text-amber-400" />;
      case "UNDER_REVIEW":
        return <AlertTriangle size={14} className="text-indigo-400" />;
      case "RESOLVED_USER":
      case "RESOLVED_ADVERTISER":
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      default:
        return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card-strong w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white">Task Dispute & Appeal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-xs text-amber-300">
              If an advertiser incorrectly rejected your task, submit evidence here. Our team will review within 24 hours.
            </p>
          </div>

          {existingDisputes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Disputes</h4>
              {existingDisputes.map((dispute) => (
                <div key={dispute.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white truncate flex-1">{dispute.reason}</span>
                    {getStatusIcon(dispute.status)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{dispute.status.replace(/_/g, " ")}</span>
                    <span>•</span>
                    <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                  </div>
                  {dispute.resolution && <p className="text-xs text-slate-400 mt-1">{dispute.resolution}</p>}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason for dispute</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you believe the task was incorrectly rejected..."
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">{reason.length}/2000 characters (minimum 10)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Evidence URLs (screenshots, videos)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="https://example.com/proof.jpg"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEvidence();
                    }
                  }}
                />
                <button type="button" onClick={addEvidence} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-all">
                  Add
                </button>
              </div>
              {evidenceUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {evidenceUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 truncate flex-1">{url}</span>
                      <button type="button" onClick={() => removeEvidence(idx)} className="text-slate-400 hover:text-rose-400 ml-2">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || reason.length < 10}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Dispute"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
