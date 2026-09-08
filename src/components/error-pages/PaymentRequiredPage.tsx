"use client";

import React from "react";
import { WifiOff, RefreshCw, Router } from "lucide-react";

export const PaymentRequiredPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">
            Network Unstable
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            This network is not stable. Please restart your network or change to another provider and reload the website.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Website
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <Router className="w-3.5 h-3.5" />
          <span>Error Code: 402</span>
        </div>
      </div>
    </div>
  );
};
