"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "mid" as const, label: "Mid", icon: Monitor },
    { id: "light" as const, label: "Light", icon: Sun },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              flex items-center justify-center p-2 rounded-lg transition-all
              ${isActive
                ? "bg-indigo-500/20 text-indigo-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }
            `}
            aria-label={`${t.label} mode`}
            title={t.label}
          >
            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
}
