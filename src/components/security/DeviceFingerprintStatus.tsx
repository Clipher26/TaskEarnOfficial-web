"use client";

import React, { useState, useEffect } from "react";
import { Shield, Smartphone, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { securityApi, DeviceFingerprintStatus as DeviceFingerprintStatusType } from "@/api/securityApi";

export function DeviceFingerprintStatus() {
  const [status, setStatus] = useState<DeviceFingerprintStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const statusData = await securityApi.getDeviceFingerprintStatus();
      setStatus(statusData);
    } catch (err) {
      console.error("Failed to load device fingerprint:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Device Fingerprint</h3>
        </div>
        <div className="text-center py-6 text-gray-500 text-xs">Loading...</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Device Fingerprint & VPN Detection</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-400 font-medium mb-1">VPN Status</p>
          <div className="flex items-center gap-1">
            {status?.is_vpn ? (
              <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-xs font-bold text-red-400">Detected</span></>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-bold text-emerald-400">Clean</span></>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Proxy Status</p>
          <div className="flex items-center gap-1">
            {status?.is_proxy ? (
              <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-xs font-bold text-red-400">Detected</span></>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-bold text-emerald-400">Clean</span></>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Emulator</p>
          <div className="flex items-center gap-1">
            {status?.is_emulator ? (
              <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-xs font-bold text-red-400">Detected</span></>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-bold text-emerald-400">None</span></>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-400 font-medium mb-1">Risk Score</p>
          <div className="flex items-center gap-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${(status?.risk_score || 0) > 50 ? "text-red-400" : "text-emerald-400"}`} />
            <span className={`text-xs font-bold ${(status?.risk_score || 0) > 50 ? "text-red-400" : "text-emerald-400"}`}>{status?.risk_score?.toFixed(0) || "0"}/100</span>
          </div>
        </div>
      </div>

      {status?.country && (
        <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Location</p>
            <p className="text-xs font-bold text-white">{status.city}, {status.country}</p>
          </div>
          {status.connection_type && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-mono">
              {status.connection_type}
            </span>
          )}
        </div>
      )}

      {status?.is_blocked && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-xs text-red-400 font-medium">This device is blocked from the platform</p>
        </div>
      )}
    </div>
  );
}
