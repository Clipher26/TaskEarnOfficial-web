"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { securityApi, VerificationStatus } from "@/api/securityEnhancedApi";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Lock, Smartphone, UserCheck, ArrowLeft } from "lucide-react";

export default function SecurityPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "2fa" | "devices" | "privacy">("overview");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadStatus();
  }, [isLoggedIn]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getVerificationStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load security status:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic": return "text-gray-400";
      case "advanced": return "text-blue-400";
      case "premium": return "text-emerald-400";
      default: return "text-gray-400";
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-emerald-400";
      case "pending": return "text-yellow-400";
      case "rejected": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              Security Center
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account security and privacy</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["overview", "2fa", "devices", "privacy"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {tab === "2fa" ? "2FA" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "overview" && status && (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    Verification Status
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-sm">Email Verification</span>
                      {status.email_verified ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-sm">Phone Verification</span>
                      {status.phone_verified ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-sm">Verification Tier</span>
                    <span className={`font-semibold capitalize ${getTierColor(status.verification_tier)}`}>{status.verification_tier}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-sm">KYC Status</span>
                    <span className={`font-semibold capitalize ${getKYCStatusColor(status.kyc_status)}`}>{status.kyc_status}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "2fa" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Two-Factor Authentication
                </h2>
                <p className="text-gray-400 text-sm mb-4">Add an extra layer of security to your account</p>
                <div className="space-y-3">
                  <button onClick={() => router.push("/security/2fa/setup")} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Authenticator App</p>
                      <p className="text-sm text-gray-400">Use TOTP app like Google Authenticator</p>
                    </div>
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </button>
                  <button onClick={() => router.push("/security/2fa/setup")} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">SMS Authentication</p>
                      <p className="text-sm text-gray-400">Receive codes via SMS</p>
                    </div>
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "devices" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Trusted Devices
                </h2>
                <p className="text-gray-400 text-sm mb-4">Manage devices that can access your account</p>
                <button onClick={() => router.push("/security/devices")} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                  <p className="font-semibold">View All Devices</p>
                  <p className="text-sm text-gray-400 mt-1">Manage and revoke device access</p>
                </button>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Privacy Settings
                </h2>
                <div className="space-y-3">
                  <button onClick={() => router.push("/security/privacy")} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <p className="font-semibold">Privacy Controls</p>
                    <p className="text-sm text-gray-400 mt-1">Manage profile visibility and data sharing</p>
                  </button>
                  <button onClick={async () => { const data = await securityApi.exportUserData(); window.open(data.download_url, "_blank"); }} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <p className="font-semibold">Export My Data</p>
                    <p className="text-sm text-gray-400 mt-1">Download all your account data (GDPR)</p>
                  </button>
                  <button onClick={async () => { if (confirm("Are you sure? This will delete your account in 30 days.")) { await securityApi.deleteAccount(); alert("Account deletion scheduled"); } }} className="w-full p-4 bg-red-900/30 border border-red-800 rounded-lg text-left hover:bg-red-900/50">
                    <p className="font-semibold text-red-400">Delete Account</p>
                    <p className="text-sm text-gray-400 mt-1">Permanently delete your account and data</p>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
