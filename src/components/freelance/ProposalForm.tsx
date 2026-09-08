"use client";

import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";

interface ProposalFormProps {
  jobId: string;
  jobTitle?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ProposalForm({ jobId, jobTitle, onSubmit, onCancel }: ProposalFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter || !proposedAmount || !estimatedDays) return;
    setSubmitting(true);
    try {
      await fetch(`/api/freelance/jobs/${jobId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cover_letter: coverLetter,
          proposed_amount: parseFloat(proposedAmount),
          estimated_duration_days: parseInt(estimatedDays),
        }),
      });
      onSubmit?.();
    } catch (err) {
      console.error("Failed to submit proposal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <h3 className="text-sm font-bold text-white">Submit Proposal</h3>
      {jobTitle && (
        <p className="text-xs text-slate-400">For: <span className="text-indigo-400">{jobTitle}</span></p>
      )}

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Cover Letter</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Explain why you're the best fit..."
          rows={4}
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Proposed Amount ($)</label>
          <input
            type="number"
            value={proposedAmount}
            onChange={(e) => setProposedAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">Duration (days)</label>
          <input
            type="number"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            placeholder="7"
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !coverLetter || !proposedAmount || !estimatedDays}
          className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={14} /> Submit Proposal
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-white transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
