"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { Briefcase, Users, TrendingUp, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { JobCard } from "@/components/freelance/JobCard";

type DashboardTab = "overview" | "jobs" | "proposals" | "contracts";

export default function EarnflexLandingPage() {
  const { setActiveModule, user } = useAppStore();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useRequireAuth();

  const [publicStats, setPublicStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isFreelancer, setIsFreelancer] = useState<boolean | null>(null);
  const [freelancerLoading, setFreelancerLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setActiveModule("earnflex");
    }
  }, [isLoading, setActiveModule]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, jobs] = await Promise.all([
          freelanceApi.getPublicStats(),
          freelanceApi.listJobs({ status: "OPEN", page: 1, limit: 6 }),
        ]);
        setPublicStats(stats);
        setRecentJobs(jobs);
      } catch (e) {
        console.error("Failed to fetch EarnFlex data", e);
      } finally {
        setStatsLoading(false);
        setJobsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    } else {
      setStatsLoading(false);
      setJobsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkFreelancerStatus = async () => {
      if (!isLoggedIn) {
        setFreelancerLoading(false);
        setIsFreelancer(false);
        return;
      }
      try {
        const status = await freelanceApi.isFreelancer();
        setIsFreelancer(status.is_freelancer);
      } catch (e) {
        setIsFreelancer(false);
      } finally {
        setFreelancerLoading(false);
      }
    };

    checkFreelancerStatus();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    if (isFreelancer === true && !isLoading) {
      router.replace("/earnflex/dashboard");
    }
  }, [isFreelancer, isLoggedIn, isLoading, router]);

  const handleJobClick = (jobId: string) => {
    router.push(`/earnflex/jobs/${jobId}`);
  };

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isFreelancer === true && !isLoading) {
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
          <h1 className="text-lg font-bold text-white">EarnFlex</h1>
          <p className="text-[10px] text-slate-400">Freelance marketplace</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Hero / Signup CTA */}
        {!freelancerLoading && isFreelancer === false && (
          <div className="glass-card p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white mb-1">Start Freelancing Today</h2>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  Join TaskEarn&apos;s freelance marketplace. Apply once, get approved within 24-48 hours, and start bidding on jobs.
                </p>
                <button
                  onClick={() => router.push("/earnflex/apply")}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  Apply as Freelancer <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Active Jobs", value: publicStats?.active_jobs ?? 0, icon: Briefcase },
            { label: "Freelancers", value: publicStats?.total_freelancers ?? 0, icon: Users },
            { label: "Total Jobs", value: publicStats?.total_jobs ?? 0, icon: TrendingUp },
            { label: "Profiles", value: publicStats?.total_profiles ?? 0, icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-3">
                <p className="text-[10px] text-slate-500 mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-white">
                  {statsLoading ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin inline" /> : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Jobs</h3>
            <button onClick={() => router.push("/earnflex/jobs")} className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight size={10} />
            </button>
          </div>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No jobs available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} onView={() => handleJobClick(job.id)} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="glass-card p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-center">
          <h3 className="text-sm font-bold text-white mb-2">Looking for Work?</h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Browse open jobs, submit proposals, and get paid securely through escrow.
          </p>
          <button
            onClick={() => router.push("/earnflex/apply")}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Become a Freelancer
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
