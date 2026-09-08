"use client";

import React from "react";
import { DollarSign, Clock, CheckCircle2, XCircle, Loader2, FileText, AlertTriangle, Users } from "lucide-react";
import { Contract, ContractStatus } from "@/types/freelance";

interface ContractCardProps {
  contract: Contract;
  onView?: () => void;
  onCancel?: () => void;
  showClientActions?: boolean;
}

const statusConfig: Record<ContractStatus, { label: string; className: string; icon: any }> = {
  [ContractStatus.ACTIVE]: { label: "Active", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Loader2 },
  [ContractStatus.COMPLETED]: { label: "Completed", className: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  [ContractStatus.CANCELLED]: { label: "Cancelled", className: "text-slate-400 bg-slate-800 border-slate-700", icon: XCircle },
  [ContractStatus.DISPUTED]: { label: "Disputed", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle },
  [ContractStatus.ARCHIVED]: { label: "Archived", className: "text-slate-400 bg-slate-800 border-slate-700", icon: XCircle },
};

export function ContractCard({ contract, onView, onCancel, showClientActions = false }: ContractCardProps) {
  const status = statusConfig[contract.status] || statusConfig[ContractStatus.ACTIVE];
  const StatusIcon = status.icon;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-white">
              {contract.job_title || `Contract #${contract.id.slice(0, 8)}`}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.className}`}>
              <StatusIcon size={10} className={contract.status === ContractStatus.ACTIVE ? "animate-spin" : ""} />
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign size={10} className="text-emerald-400" />
              {contract.amount} {contract.currency}
            </span>
            <span className="flex items-center gap-1">
              <Users size={10} className="text-indigo-400" />
              {contract.freelancer_name || contract.freelancer_id.slice(0, 8)}
            </span>
            {contract.start_date && (
              <span className="flex items-center gap-1">
                <Clock size={10} className="text-cyan-400" />
                Started {new Date(contract.start_date).toLocaleDateString()}
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
        {showClientActions && contract.status === ContractStatus.ACTIVE && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-rose-400 hover:border-rose-500/20 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
