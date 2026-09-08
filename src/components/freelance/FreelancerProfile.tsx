"use client";

import React from "react";
import { User, Mail, Phone, Globe, Briefcase, DollarSign, Star, Shield, Loader2 } from "lucide-react";
import { FreelancerProfile, SkillLevel } from "@/types/freelance";

interface FreelancerProfileProps {
  profile: FreelancerProfile | null;
  loading?: boolean;
  onEdit?: () => void;
}

const levelConfig: Record<SkillLevel, { label: string; className: string }> = {
  [SkillLevel.BEGINNER]: { label: "Beginner", className: "text-emerald-400 bg-emerald-500/10" },
  [SkillLevel.INTERMEDIATE]: { label: "Intermediate", className: "text-amber-400 bg-amber-500/10" },
  [SkillLevel.EXPERT]: { label: "Expert", className: "text-rose-400 bg-rose-500/10" },
};

export function FreelancerProfileView({ profile, loading, onEdit }: FreelancerProfileProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User size={48} className="text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">No profile found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Freelancer Profile</h3>
              {profile.is_verified && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Shield size={10} /> Verified
                </span>
              )}
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Edit
            </button>
          )}
        </div>

        {profile.headline && (
          <p className="text-xs text-slate-300 mb-2">{profile.headline}</p>
        )}
        {profile.bio && (
          <p className="text-xs text-slate-400 mb-3">{profile.bio}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1">Hourly Rate</p>
            <p className="text-sm font-bold text-white flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-400" />
              {profile.hourly_rate || 0} {profile.currency}
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1">Rating</p>
            <p className="text-sm font-bold text-white flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              {profile.rating.toFixed(1)} ({profile.total_reviews})
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1">Jobs Completed</p>
            <p className="text-sm font-bold text-white">{profile.jobs_completed}</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1">Total Earned</p>
            <p className="text-sm font-bold text-white">{profile.total_earned} {profile.currency}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((skill) => (
                <span key={skill.id} className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {profile.languages.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Languages</p>
              <div className="flex flex-wrap gap-1">
                {profile.languages.map((lang, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.portfolio_urls.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1">Portfolio</p>
              {profile.portfolio_urls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">
                  <Globe size={10} /> {url}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
