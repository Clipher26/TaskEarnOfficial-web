"use client";

import React, { useState } from "react";
import { Loader2, Send, Briefcase } from "lucide-react";

interface ApplicationFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ApplicationForm({ onSubmit, onCancel }: ApplicationFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !skills || !experienceYears) return;
    setSubmitting(true);
    try {
      await fetch("/api/freelance/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phoneNumber || undefined,
          portfolio_url: portfolioUrl || undefined,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience_years: parseInt(experienceYears),
          bio: bio || undefined,
        }),
      });
      onSubmit?.();
    } catch (err) {
      console.error("Failed to submit application:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase size={20} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Freelancer Application</h3>
      </div>
      <p className="text-xs text-slate-400">Apply to become a freelancer on EarnFlex and start earning.</p>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Full Name *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Portfolio URL</label>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.com"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Skills (comma separated) *</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, Node.js, Python"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Years of Experience *</label>
        <input
          type="number"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          placeholder="3"
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !fullName || !email || !skills || !experienceYears}
          className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={14} /> Submit Application
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-white transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
