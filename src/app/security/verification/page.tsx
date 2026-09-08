"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { securityApi } from "@/api/securityEnhancedApi";
import { ArrowLeft, Shield, UserCheck, Upload, CheckCircle2, XCircle } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadStatus();
  }, [isLoggedIn]);

  const loadStatus = async () => {
    setLoading(false);
    try {
      const data = await securityApi.getVerificationStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load verification status:", err);
    }
  };

  const handleVerifyEmail = async () => {
    const code = prompt("Enter verification code:");
    if (!code) return;
    setVerifying(true);
    try {
      await securityApi.verifyEmail(code);
      alert("Email verified successfully!");
      loadStatus();
    } catch (err) {
      alert("Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPhone = async () => {
    const phone = prompt("Enter phone number:");
    if (!phone) return;
    const code = prompt("Enter verification code:");
    if (!code) return;
    setVerifying(true);
    try {
      await securityApi.verifyPhone(phone, code);
      alert("Phone verified successfully!");
      loadStatus();
    } catch (err) {
      alert("Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyKYC = async () => {
    const idUrl = prompt("Enter ID document URL:");
    if (!idUrl) return;
    const selfieUrl = prompt("Enter selfie URL:");
    if (!selfieUrl) return;
    const addressUrl = prompt("Enter proof of address URL:");
    if (!addressUrl) return;
    setVerifying(true);
    try {
      await securityApi.verifyKYC(idUrl, selfieUrl, addressUrl, "John", "Doe", "1990-01-01", "NG");
      alert("KYC submitted for review!");
      loadStatus();
    } catch (err) {
      alert("KYC verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-400" />
              Identity Verification
            </h1>
            <p className="text-gray-400 text-sm mt-1">Verify your identity to unlock higher limits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Email Verification</h2>
                <p className="text-sm text-gray-400">Basic verification tier</p>
              </div>
              {status?.email_verified ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
            </div>
            {!status?.email_verified && (
              <button onClick={handleVerifyEmail} disabled={verifying} className="w-full py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {verifying ? "Verifying..." : "Verify Email"}
              </button>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Phone Verification</h2>
                <p className="text-sm text-gray-400">Advanced verification tier</p>
              </div>
              {status?.phone_verified ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
            </div>
            {!status?.phone_verified && (
              <button onClick={handleVerifyPhone} disabled={verifying} className="w-full py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {verifying ? "Verifying..." : "Verify Phone"}
              </button>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">KYC Verification</h2>
                <p className="text-sm text-gray-400">Premium verification tier - unlimited access</p>
              </div>
              {status?.kyc_status === "approved" ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
            </div>
            {status?.kyc_status !== "approved" && (
              <button onClick={handleVerifyKYC} disabled={verifying} className="w-full py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                {verifying ? "Submitting..." : "Complete KYC"}
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
