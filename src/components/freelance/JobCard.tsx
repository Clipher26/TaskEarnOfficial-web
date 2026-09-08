"use client";

import React from "react";
import { Briefcase, DollarSign, Clock, MapPin, Star, Users, Bookmark, Share2 } from "lucide-react";
import { Job, JobStatus, SkillLevel } from "@/types/freelance";

interface JobCardProps {
  job: Job;
  onView?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  [JobStatus.DRAFT]: { label: "Draft", className: "text-slate-400 bg-slate-800 border-slate-700" },
  [JobStatus.OPEN]: { label: "Open", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  [JobStatus.IN_PROGRESS]: { label: "In Progress", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  [JobStatus.COMPLETED]: { label: "Completed", className: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  [JobStatus.CANCELLED]: { label: "Cancelled", className: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  [JobStatus.DISPUTED]: { label: "Disputed", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

const levelConfig: Record<SkillLevel, { label: string; className: string }> = {
  [SkillLevel.BEGINNER]: { label: "Beginner", className: "text-emerald-400 bg-emerald-500/10" },
  [SkillLevel.INTERMEDIATE]: { label: "Intermediate", className: "text-amber-400 bg-amber-500/10" },
  [SkillLevel.EXPERT]: { label: "Expert", className: "text-rose-400 bg-rose-500/10" },
};

export function JobCard({ job, onView, onSave, onShare }: JobCardProps) {
  const status = statusConfig[job.status] || statusConfig[JobStatus.DRAFT];
  const level = levelConfig[job.experience_level] || levelConfig[SkillLevel.BEGINNER];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-white">{job.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.className}`}>
              {status.label}
            </span>
            {job.is_featured && (
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                Featured
              </span>
            )}
            {job.is_urgent && (
              <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                Urgent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{job.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {job.skills_required.slice(0, 4).map((skill) => (
          <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            {skill}
          </span>
        ))}
        {job.skills_required.length > 4 && (
          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
            +{job.skills_required.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${level.className}`}>
          <Star size={10} />
          {level.label}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={10} className="text-indigo-400" />
          {job.category}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={10} className="text-cyan-400" />
          {job.location_type}
        </span>
        {job.estimated_duration_days && (
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-amber-400" />
            {job.estimated_duration_days} days
          </span>
        )}
        <span className="flex items-center gap-1">
          <DollarSign size={10} className="text-emerald-400" />
          {job.budget_type === "FIXED" ? "Fixed" : "Hourly"}
          {job.budget_type === "FIXED" && job.budget_min && ` $${job.budget_min}`}
          {job.budget_type === "HOURLY" && job.hourly_rate_min && ` $${job.hourly_rate_min}/hr`}
        </span>
        <span className="flex items-center gap-1">
          <Users size={10} className="text-purple-400" />
          {job.proposals_count}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onView}
          className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          View Details
        </button>
        <button
          onClick={onSave}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all"
        >
          <Bookmark size={16} />
        </button>
        <button
          onClick={onShare}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}
