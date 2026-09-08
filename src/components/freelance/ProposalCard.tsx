"use client";

import React from "react";
import { DollarSign, Clock, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";
import { Proposal, ProposalStatus } from "@/types/freelance";

interface ProposalCardProps {
  proposal: Proposal;
  onView?: () => void;
  onWithdraw?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showClientActions?: boolean;
}

const statusConfig: Record<ProposalStatus, { label: string; className: string; icon: any }> = {
  [ProposalStatus.PENDING]: { label: "Pending", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Loader2 },
  [ProposalStatus.ACCEPTED]: { label: "Accepted", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  [ProposalStatus.REJECTED]: { label: "Rejected", className: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
  [ProposalStatus.WITHDRAWN]: { label: "Withdrawn", className: "text-slate-400 bg-slate-800 border-slate-700", icon: XCircle },
};

export function ProposalCard({ proposal, onView, onWithdraw, onAccept, onReject, showClientActions = false }: ProposalCardProps) {
  const status = statusConfig[proposal.status] || statusConfig[ProposalStatus.PENDING];
  const StatusIcon = status.icon;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">
              {proposal.freelancer_name || `Proposal #${proposal.id.slice(0, 8)}`}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.className}`}>
              <StatusIcon size={10} className={proposal.status === ProposalStatus.PENDING ? "animate-spin" : ""} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{proposal.cover_letter}</p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-400" />
              {proposal.proposed_amount} {proposal.currency}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} className="text-indigo-400" />
              {proposal.estimated_duration_days} days
            </span>
            <span className="flex items-center gap-1">
              <FileText size={10} className="text-slate-400" />
              Job #{proposal.job_id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      {proposal.client_note && (
        <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400">Client Note: {proposal.client_note}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onView}
          className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          View Details
        </button>
        {!showClientActions && proposal.status === ProposalStatus.PENDING && onWithdraw && (
          <button
            onClick={onWithdraw}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-rose-400 hover:border-rose-500/20 transition-all"
          >
            Withdraw
          </button>
        )}
        {showClientActions && proposal.status === ProposalStatus.PENDING && (
          <>
            {onAccept && (
              <button
                onClick={onAccept}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-rose-400 hover:border-rose-500/20 transition-all"
              >
                Reject
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
