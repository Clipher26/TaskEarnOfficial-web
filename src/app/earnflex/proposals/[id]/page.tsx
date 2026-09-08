"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter, useParams } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { ProposalStatus } from "@/types/freelance";
import { Loader2, ArrowRight, XCircle, Clock, CheckCircle2 } from "lucide-react";

export default function ProposalDetailPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string | undefined;
  if (!proposalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await freelanceApi.getProposal(proposalId);
        setProposal(data);
      } catch (e) {
        console.error("Failed to load proposal", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [proposalId]);

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Proposal Not Found</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 text-center">
          <XCircle size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">The proposal you are looking for does not exist.</p>
          <button onClick={() => router.push("/earnflex/proposals")} className="mt-4 px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
            My Proposals
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const statusColors: Record<ProposalStatus, string> = {
    [ProposalStatus.PENDING]: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    [ProposalStatus.ACCEPTED]: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    [ProposalStatus.REJECTED]: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    [ProposalStatus.WITHDRAWN]: "text-slate-400 bg-slate-800 border-slate-700",
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-800 rounded-lg">
            <ArrowRight size={18} className="text-slate-400 rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Proposal Details</h1>
            <p className="text-[10px] text-slate-400">Status: {proposal.status}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Proposal</span>
            <span className={`text-[10px] px-2 py-1 border rounded-lg ${statusColors[proposal.status as ProposalStatus] || statusColors[ProposalStatus.PENDING]}`}>
              {proposal.status}
            </span>
          </div>

          <div>
            <h3 className="text-xs text-slate-500 mb-1">Cover Letter</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{proposal.cover_letter}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Proposed Amount</p>
              <p className="text-sm font-bold text-white">${proposal.proposed_amount}</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Duration</p>
              <p className="text-sm font-bold text-white">{proposal.estimated_duration_hours} hours</p>
            </div>
          </div>

          {proposal.client_note && (
            <div>
              <h3 className="text-xs text-slate-500 mb-1">Client Note</h3>
              <p className="text-xs text-slate-300">{proposal.client_note}</p>
            </div>
          )}

          <div className="text-[10px] text-slate-500">
            Submitted: {proposal.created_at ? new Date(proposal.created_at).toLocaleString() : "-"}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
