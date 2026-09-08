"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { JobStatus, JobType, ExperienceLevel } from "@/types/freelance";
import { Briefcase, Search, Filter, Plus, Loader2 } from "lucide-react";
import { JobCard } from "@/components/freelance/JobCard";
import { JobFilters, JobFiltersProps } from "@/components/freelance/JobFilters";

export default function JobsPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersProps["filters"]>({
    status: JobStatus.OPEN,
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await freelanceApi.listJobs(filters);
        setJobs(data);
      } catch (e) {
        console.error("Failed to load jobs", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Jobs</h1>
            <p className="text-[10px] text-slate-400">Browse available freelance work</p>
          </div>
          <button
            onClick={() => router.push("/earnflex/post-job")}
            className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <JobFilters filters={filters} onFiltersChange={setFilters} />
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No jobs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onView={() => router.push(`/earnflex/jobs/${job.id}`)} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
