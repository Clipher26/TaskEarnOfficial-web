"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { JobStatus, SkillLevel, JobFilters as JobFiltersType } from "@/types/freelance";

export interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

const categories = [
  "Web Development", "Mobile Development", "Design", "Writing", "Marketing",
  "Data Science", "DevOps", "Blockchain", "AI/ML", "Video Editing",
];

const skillOptions = [
  "React", "Node.js", "Python", "JavaScript", "TypeScript", "Vue", "Angular",
  "Flutter", "React Native", "Docker", "Kubernetes", "AWS", "Figma", "UI/UX",
];

const statusOptions: { value: JobStatus | ""; label: string }[] = [
  { value: JobStatus.OPEN, label: "Open" },
  { value: JobStatus.IN_PROGRESS, label: "In Progress" },
  { value: JobStatus.COMPLETED, label: "Completed" },
];

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const toggleSkill = (skill: string) => {
    const current = filters.skills || [];
    const next = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    onFiltersChange({ ...filters, skills: next });
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Filters</h3>
        {(filters.category || (filters.skills && filters.skills.length > 0) || filters.status) && (
          <button
            onClick={() => onFiltersChange({ ...filters, category: undefined, skills: [], status: undefined, search: "" })}
            className="ml-auto text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1">Category</p>
        <select
          value={filters.category || ""}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1">Status</p>
        <select
          value={filters.status || ""}
          onChange={(e) => onFiltersChange({ ...filters, status: (e.target.value || undefined) as JobStatus | undefined })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1">Experience Level</p>
        <select
          value={filters.experience_level || ""}
          onChange={(e) => onFiltersChange({ ...filters, experience_level: (e.target.value || undefined) as SkillLevel | undefined })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Levels</option>
          <option value={SkillLevel.BEGINNER}>Beginner</option>
          <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
          <option value={SkillLevel.EXPERT}>Expert</option>
        </select>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {skillOptions.map((skill) => {
            const isActive = (filters.skills || []).includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
