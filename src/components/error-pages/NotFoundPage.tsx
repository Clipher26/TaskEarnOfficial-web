"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">
            TaskEarn Unavailable
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Please try again later.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <span>Error Code: 404</span>
        </div>
      </div>
    </div>
  );
};
