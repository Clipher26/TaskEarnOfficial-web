"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { freelanceApi } from "@/services/api/freelance";
import { ApplicationStatus } from "@/types/freelance";
import { Briefcase, Upload, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function ApplyPage() {
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingStatus, setExistingStatus] = useState<ApplicationStatus | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    bio: "",
    skills: "",
    experience_years: 0,
    hourly_rate: "",
    portfolio_url: "",
    resume_url: "",
    id_document_url: "",
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnflex");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const checkStatus = async () => {
      try {
        const app = await freelanceApi.getMyApplication();
        if (app) {
          setExistingStatus(app.status);
        }
      } catch (e) {
        // no application yet
      }
    };
    checkStatus();
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await freelanceApi.submitApplication({
        ...form,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to submit application");
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
            <h1 className="text-lg font-bold text-white">Apply as Freelancer</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Application Submitted</h2>
          <p className="text-sm text-slate-400 mb-4">Our team will review your application and get back to you within 24-48 hours.</p>
          <button onClick={() => router.push("/earnflex")} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
            Back to EarnFlex
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (existingStatus) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Apply as Freelancer</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <Briefcase size={48} className="text-indigo-400 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Application {existingStatus}</h2>
          <p className="text-sm text-slate-400 mb-4">
            {existingStatus === ApplicationStatus.PENDING && "Your application is pending review."}
            {existingStatus === ApplicationStatus.APPROVED && "You are already an approved freelancer!"}
            {existingStatus === ApplicationStatus.REJECTED && "Your application was not approved. You can reapply after 30 days."}
          </p>
          <button onClick={() => router.push("/earnflex")} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
            Back to EarnFlex
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
            <h1 className="text-lg font-bold text-white">Apply as Freelancer</h1>
            <p className="text-[10px] text-slate-400">Join the EarnFlex marketplace</p>
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
              <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Professional Headline *</label>
              <input
                type="text"
                required
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Full-stack developer | 5+ years experience"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Bio *</label>
              <textarea
                required
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Tell us about your experience and expertise..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Skills * (comma separated)</label>
              <input
                type="text"
                required
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="React, Node.js, Python, UI/UX Design"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Years of Experience *</label>
              <input
                type="number"
                required
                min="0"
                max="50"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Hourly Rate (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Portfolio URL</label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Resume URL</label>
              <input
                type="url"
                value={form.resume_url}
                onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://drive.google.com/your-resume"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">ID Document URL</label>
              <input
                type="url"
                value={form.id_document_url}
                onChange={(e) => setForm({ ...form, id_document_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://drive.google.com/your-id"
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
                Submitting...
              </>
            ) : (
              <>
                <Briefcase size={16} />
                Submit Application
              </>
            )}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
