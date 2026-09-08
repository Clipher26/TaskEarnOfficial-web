"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { securityApi, PrivacySettings } from "@/api/securityEnhancedApi";
import { ArrowLeft, Eye, EyeOff, Globe, Bell, Shield, Download, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadSettings();
  }, [isLoggedIn]);

  const loadSettings = async () => {
    setLoading(false);
    try {
      const data = await securityApi.getPrivacySettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load privacy settings:", err);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const updated = await securityApi.updatePrivacySettings({ [key]: value });
      setSettings(updated);
    } catch (err) {
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await securityApi.exportUserData();
      window.open(data.download_url, "_blank");
    } catch (err) {
      alert("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account in 30 days.")) return;
    try {
      await securityApi.deleteAccount();
      alert("Account deletion scheduled");
    } catch (err) {
      alert("Failed to delete account");
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
              <Shield className="w-6 h-6 text-emerald-400" />
              Privacy Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">Control your data and privacy</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Profile Visibility
            </h2>
            <select value={settings?.profile_visibility || "public"} onChange={(e) => updateSetting("profile_visibility", e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white" disabled={saving}>
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Data Sharing
            </h2>
            {[
              { key: "show_earnings", label: "Show Earnings" },
              { key: "show_achievements", label: "Show Achievements" },
              { key: "show_activity", label: "Show Activity" },
              { key: "allow_messages", label: "Allow Messages" },
              { key: "share_data_for_stats", label: "Share Data for Stats" },
              { key: "show_referral_link", label: "Show Referral Link" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <button onClick={() => updateSetting(key, !settings?.[key as keyof PrivacySettings])} className={`w-12 h-6 rounded-full transition-colors ${settings?.[key as keyof PrivacySettings] ? "bg-emerald-600" : "bg-gray-700"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings?.[key as keyof PrivacySettings] ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Data Management
            </h2>
            <button onClick={handleExportData} className="w-full p-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
              <p className="font-semibold">Export My Data</p>
              <p className="text-sm text-gray-400 mt-1">Download all your account data</p>
            </button>
            <button onClick={handleDeleteAccount} className="w-full p-3 bg-red-900/30 border border-red-800 rounded-lg text-left hover:bg-red-900/50">
              <p className="font-semibold text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </p>
              <p className="text-sm text-gray-400 mt-1">Permanently delete your account</p>
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
