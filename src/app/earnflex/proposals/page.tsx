"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { ProposalStatus } from "@/types/freelance";
import { FileText, Loader2, ArrowRight, XCircle } from "lucide-react";
import { ProposalCard } from "@/components/freelance/ProposalCard";

export default function ProposalsPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();

  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await freelanceApi.getMyProposals();
        setProposals(data);
      } catch (e) {
        console.error("Failed to load proposals", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">My Proposals</h1>
          <p className="text-[10px] text-slate-400">Track your job proposals</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No proposals yet</p>
            <button
              onClick={() => router.push("/earnflex/jobs")}
              className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onView={() => router.push(`/earnflex/proposals/${proposal.id}`)}
            />
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
