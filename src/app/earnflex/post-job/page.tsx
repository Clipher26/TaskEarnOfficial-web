"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { JobType, ExperienceLevel } from "@/types/freelance";
import { Briefcase, Loader2, ArrowRight, X } from "lucide-react";

export default function PostJobPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    job_type: JobType.FIXED,
    budget_min: "",
    budget_max: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    estimated_duration_hours: "",
    experience_level: ExperienceLevel.ENTRY,
    required_skills: "",
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await freelanceApi.createJob({
        ...form,
        budget_min: form.budget_min ? parseFloat(form.budget_min) : undefined,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : undefined,
        hourly_rate_min: form.hourly_rate_min ? parseFloat(form.hourly_rate_min) : undefined,
        hourly_rate_max: form.hourly_rate_max ? parseFloat(form.hourly_rate_max) : undefined,
        estimated_duration_hours: form.estimated_duration_hours ? parseInt(form.estimated_duration_hours) : undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Post a Job</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <Briefcase size={48} className="text-emerald-400 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Job Posted</h2>
          <p className="text-sm text-slate-400 mb-4">Your job has been posted successfully. Freelancers will now be able to submit proposals.</p>
          <button onClick={() => router.push("/earnflex/jobs")} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
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
            <h1 className="text-lg font-bold text-white">Post a Job</h1>
            <p className="text-[10px] text-slate-400">Find the perfect freelancer</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="glass-card p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Job Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. Build a React dashboard"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Describe the job in detail..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Requirements</label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Any specific requirements..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Job Type *</label>
                <select
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value as JobType })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value={JobType.FIXED}>Fixed Price</option>
                  <option value={JobType.HOURLY}>Hourly</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Experience Level *</label>
                <select
                  value={form.experience_level}
                  onChange={(e) => setForm({ ...form, experience_level: e.target.value as ExperienceLevel })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value={ExperienceLevel.ENTRY}>Entry</option>
                  <option value={ExperienceLevel.INTERMEDIATE}>Intermediate</option>
                  <option value={ExperienceLevel.EXPERT}>Expert</option>
                </select>
              </div>
            </div>

            {form.job_type === JobType.FIXED ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Min Budget ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.budget_min}
                    onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Budget ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.budget_max}
                    onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Min Hourly Rate ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.hourly_rate_min}
                    onChange={(e) => setForm({ ...form, hourly_rate_min: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Hourly Rate ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.hourly_rate_max}
                    onChange={(e) => setForm({ ...form, hourly_rate_max: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Estimated Duration (hours)</label>
              <input
                type="number"
                min="1"
                value={form.estimated_duration_hours}
                onChange={(e) => setForm({ ...form, estimated_duration_hours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Required Skills * (comma separated)</label>
              <input
                type="text"
                required
                value={form.required_skills}
                onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="React, Node.js, Python"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Briefcase size={16} />
                Post Job
              </>
            )}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
