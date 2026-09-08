"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFreelanceDashboardStats, useFreelanceJobs, useFreelanceContracts, useFreelanceProposals } from "@/hooks/useFreelance";
import { Briefcase, DollarSign, Clock, Star, FileText, Users, TrendingUp, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/freelance/JobCard";
import { ProposalCard } from "@/components/freelance/ProposalCard";
import { ContractCard } from "@/components/freelance/ContractCard";
import { JobFilters, JobFiltersProps } from "@/components/freelance/JobFilters";
import { JobStatus } from "@/types/freelance";

type DashboardTab = "overview" | "jobs" | "proposals" | "contracts";

export default function EarnflexDashboardPage() {
  const { setActiveModule, user } = useAppStore();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const { stats, loading: statsLoading, refetch: refetchStats } = useFreelanceDashboardStats();
  const { jobs, loading: jobsLoading, refetch: refetchJobs } = useFreelanceJobs({ status: JobStatus.OPEN });
  const { proposals, loading: proposalsLoading } = useFreelanceProposals({});
  const { contracts, loading: contractsLoading } = useFreelanceContracts({});

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  const handleJobClick = (jobId: string) => {
    router.push(`/earnflex/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">EarnFlex</h1>
          <p className="text-[10px] text-slate-400">Freelance marketplace</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: "overview" as DashboardTab, label: "Overview", icon: TrendingUp },
            { id: "jobs" as DashboardTab, label: "Jobs", icon: Briefcase },
            { id: "proposals" as DashboardTab, label: "Proposals", icon: FileText },
            { id: "contracts" as DashboardTab, label: "Contracts", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Active Jobs</p>
                    <p className="text-lg font-bold text-white">{stats.active_jobs || 0}</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Total Proposals</p>
                    <p className="text-lg font-bold text-white">{stats.total_proposals || 0}</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Active Contracts</p>
                    <p className="text-lg font-bold text-white">{stats.active_contracts || 0}</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Total Earned</p>
                    <p className="text-lg font-bold text-white">{stats.total_earned || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/earnflex/post-job")}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Post a Job
                  </button>
                  <button
                    onClick={() => router.push("/earnflex/apply")}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Briefcase size={14} /> Apply as Freelancer
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Recent Jobs</h3>
                    <button onClick={() => setActiveTab("jobs")} className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">
                      View All <ArrowRight size={10} />
                    </button>
                  </div>
                  {jobsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase size={32} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No jobs available</p>
                    </div>
                  ) : (
                    jobs.slice(0, 3).map((job) => (
                      <JobCard key={job.id} job={job} onView={() => handleJobClick(job.id)} />
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No stats available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-4">
            <JobFilters
              filters={{ status: JobStatus.OPEN, page: 1, limit: 20 }}
              onFiltersChange={(f) => refetchJobs()}
            />
            <div className="space-y-3">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No jobs available</p>
                  <button
                    onClick={() => router.push("/earnflex/post-job")}
                    className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                  >
                    Post a Job
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <JobCard key={job.id} job={job} onView={() => handleJobClick(job.id)} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "proposals" && (
          <div className="space-y-3">
            {proposalsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No proposals yet</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))
            )}
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="space-y-3">
            {contractsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No contracts yet</p>
              </div>
            ) : (
              contracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
