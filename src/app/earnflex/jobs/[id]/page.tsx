"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter, useParams } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { JobStatus } from "@/types/freelance";
import { Briefcase, Loader2, ArrowRight, XCircle } from "lucide-react";
import { ProposalForm } from "@/components/freelance/ProposalForm";

export default function JobDetailPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string | undefined;
  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await freelanceApi.getJob(jobId);
        setJob(data);
      } catch (e) {
        console.error("Failed to load job", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

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

  if (!job) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Job Not Found</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 text-center">
          <XCircle size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">The job you are looking for does not exist.</p>
          <button onClick={() => router.push("/earnflex/jobs")} className="mt-4 px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
            Browse Jobs
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
            <h1 className="text-lg font-bold text-white">Job Details</h1>
            <p className="text-[10px] text-slate-400">{job.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-400" />
              <h2 className="text-base font-bold text-white">{job.title}</h2>
            </div>
            <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              {job.status}
            </span>
          </div>

          <p className="text-xs text-slate-400 whitespace-pre-wrap">{job.description}</p>

          {job.requirements && (
            <div>
              <h3 className="text-xs font-bold text-white mb-1">Requirements</h3>
              <p className="text-xs text-slate-400 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Budget</p>
              <p className="text-sm font-bold text-white">${job.budget_min} - ${job.budget_max}</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Type</p>
              <p className="text-sm font-bold text-white">{job.job_type}</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Experience</p>
              <p className="text-sm font-bold text-white">{job.experience_level}</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1">Proposals</p>
              <p className="text-sm font-bold text-white">{job.total_proposals || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white mb-1">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.required_skills || "").split(",").map((skill: string, idx: number) => (
                <span key={idx} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {job.status === JobStatus.OPEN && (
          <button
            onClick={() => setShowProposalForm(true)}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Submit Proposal
          </button>
        )}

        {showProposalForm && (
          <ProposalForm
            jobId={jobId}
            onCancel={() => setShowProposalForm(false)}
            onSubmit={() => {
              setShowProposalForm(false);
              router.push("/earnflex/proposals");
            }}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
