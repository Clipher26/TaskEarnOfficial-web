"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter, useParams } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { ContractStatus, MilestoneStatus } from "@/types/freelance";
import { Loader2, ArrowRight, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { MilestoneCard } from "@/components/freelance/MilestoneCard";
import { MilestoneForm } from "@/components/freelance/MilestoneForm";

export default function ContractDetailPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id as string | undefined;
  if (!contractId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const [contract, setContract] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [contractData, milestonesData] = await Promise.all([
          freelanceApi.getContract(contractId),
          freelanceApi.getMilestones(contractId),
        ]);
        setContract(contractData);
        setMilestones(milestonesData);
      } catch (e) {
        console.error("Failed to load contract", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contractId]);

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

  if (!contract) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Contract Not Found</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 text-center">
          <XCircle size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">The contract you are looking for does not exist.</p>
          <button onClick={() => router.push("/earnflex/contracts")} className="mt-4 px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
            My Contracts
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-800 rounded-lg">
            <ArrowRight size={18} className="text-slate-400 rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Contract Details</h1>
            <p className="text-[10px] text-slate-400">{contract.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">{contract.title}</span>
            <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              {contract.status}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-3">{contract.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Total Amount</p>
              <p className="text-sm font-bold text-white">${contract.total_amount}</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Total Paid</p>
              <p className="text-sm font-bold text-white">${contract.total_paid || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Milestones</h3>
          {contract.status === ContractStatus.ACTIVE && (
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="text-[10px] px-3 py-1.5 bg-indigo-500 text-white rounded-lg font-bold"
            >
              Add Milestone
            </button>
          )}
        </div>

        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No milestones yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        )}

        {showMilestoneForm && (
          <MilestoneForm
            contractId={contractId}
            onCancel={() => setShowMilestoneForm(false)}
            onSubmit={() => {
              setShowMilestoneForm(false);
              freelanceApi.getMilestones(contractId).then(setMilestones);
            }}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
