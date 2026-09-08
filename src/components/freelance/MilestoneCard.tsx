"use client";

import React from "react";
import { DollarSign, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Milestone, MilestoneStatus } from "@/types/freelance";

interface MilestoneCardProps {
  milestone: Milestone;
  onView?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const statusConfig: Record<MilestoneStatus, { label: string; className: string; icon: any }> = {
  [MilestoneStatus.PENDING]: { label: "Pending", className: "text-slate-400 bg-slate-800 border-slate-700", icon: Clock },
  [MilestoneStatus.IN_PROGRESS]: { label: "In Progress", className: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Loader2 },
  [MilestoneStatus.SUBMITTED]: { label: "Submitted", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Loader2 },
  [MilestoneStatus.APPROVED]: { label: "Approved", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  [MilestoneStatus.REJECTED]: { label: "Rejected", className: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
  [MilestoneStatus.PAID]: { label: "Paid", className: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: CheckCircle2 },
};

export function MilestoneCard({ milestone, onView, onSubmit, onApprove, onReject, showActions = false }: MilestoneCardProps) {
  const status = statusConfig[milestone.status] || statusConfig[MilestoneStatus.PENDING];
  const StatusIcon = status.icon;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-white">{milestone.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.className}`}>
              <StatusIcon size={10} className={milestone.status === MilestoneStatus.SUBMITTED || milestone.status === MilestoneStatus.IN_PROGRESS ? "animate-spin" : ""} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{milestone.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-400" />
              {milestone.amount} {milestone.currency}
            </span>
            {milestone.due_date && (
              <span className="flex items-center gap-1">
                <Clock size={10} className="text-amber-400" />
                Due {new Date(milestone.due_date).toLocaleDateString()}
              </span>
            )}
            {milestone.submitted_at && (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={10} className="text-blue-400" />
                Submitted {new Date(milestone.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onView}
          className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          View Details
        </button>
        {showActions && milestone.status === MilestoneStatus.PENDING && onSubmit && (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Submit
          </button>
        )}
        {showActions && milestone.status === MilestoneStatus.SUBMITTED && (
          <>
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Approve
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
