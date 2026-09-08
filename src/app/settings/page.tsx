"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Eye, EyeOff, Trash2, Lock, Bell, Shield, Palette, Globe, Moon, Sun, Volume2, VolumeX, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function SettingsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useRequireAuth();
  const { user, setUser } = useAppStore();
  const [hideBalance, setHideBalance] = useState(false);
  const [freezeWithdrawal, setFreezeWithdrawal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("settings") : null;
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setHideBalance(settings.hideBalance || false);
        setFreezeWithdrawal(settings.freezeWithdrawal || false);
        setDarkMode(settings.darkMode ?? true);
        setNotificationsEnabled(settings.notificationsEnabled ?? true);
        setSoundEnabled(settings.soundEnabled ?? true);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, [isLoggedIn]);

  const saveSettings = () => {
    const settings = {
      hideBalance,
      freezeWithdrawal,
      darkMode,
      notificationsEnabled,
      soundEnabled,
    };
    localStorage.setItem("settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    alert("Account deletion request submitted. This action cannot be undone.");
    setShowDeleteConfirm(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SettingRow = ({ icon: Icon, label, description, children }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs font-medium text-white">{label}</p>
          {description && <p className="text-[10px] text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
        checked ? "bg-indigo-500" : "bg-slate-700"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-950">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Settings</h1>
              <p className="text-[10px] text-slate-400">App preferences & account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-xs text-emerald-400">Settings saved</span>
          </div>
        )}

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-3">Privacy & Security</h3>
          <SettingRow
            icon={hideBalance ? EyeOff : Eye}
            label="Hide Balance"
            description="Mask wallet balances on home screen"
          >
            <Toggle checked={hideBalance} onChange={setHideBalance} />
          </SettingRow>
          <SettingRow
            icon={Lock}
            label="Freeze Withdrawal"
            description="Temporarily block all withdrawal requests"
          >
            <Toggle checked={freezeWithdrawal} onChange={setFreezeWithdrawal} />
          </SettingRow>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-3">Preferences</h3>
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            description="Use dark theme across the app"
          >
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </SettingRow>
          <SettingRow
            icon={Bell}
            label="Notifications"
            description="Push notifications for earnings & alerts"
          >
            <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
          </SettingRow>
          <SettingRow
            icon={Volume2}
            label="Sound Effects"
            description="Game sounds and UI feedback"
          >
            <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
          </SettingRow>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
          <button
            onClick={() => router.push("/profile-customization")}
            className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <span className="text-xs text-slate-300">Personal Information</span>
            </div>
            <span className="text-[10px] text-slate-500">Telegram ID, username, etc.</span>
          </button>
          <button
            onClick={() => router.push("/kyc")}
            className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <span className="text-xs text-slate-300">Verification</span>
            </div>
            <span className="text-[10px] text-slate-500">KYC & security</span>
          </button>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-rose-400 mb-3">Danger Zone</h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-rose-400" />
              <span className="text-xs text-rose-400 font-medium">Delete Account</span>
            </div>
            <span className="text-[10px] text-rose-500/70">Permanent</span>
          </button>
        </div>

        <button
          onClick={saveSettings}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all"
        >
          Save Settings
        </button>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-rose-400" />
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              This will permanently delete your account, all earnings, and data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-rose-500 text-white text-xs font-medium rounded-xl hover:bg-rose-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
