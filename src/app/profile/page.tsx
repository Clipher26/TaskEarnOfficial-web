"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { User, Crown, Flame, TrendingUp, Wallet, Plus, Settings, LogOut, ChevronRight, CreditCard, Landmark, Phone, Shield, RefreshCw, Bell, Copy, CheckCircle2, ExternalLink, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useVipData } from "@/hooks/useVipData";
import { walletApi, DepositOptionsResponse, BankDepositOption, CryptoDepositOption } from "@/api/walletApi";
import { notificationApi, NotificationResponse } from "@/api/notificationApi";
import { authApi } from "@/api/authApi";

export default function ProfilePage() {
  const { setActiveModule, wallet, user, isLoading, setLoading, setUser } = useAppStore();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useRequireAuth();
  const { data: vipData, loading: vipLoading } = useVipData(user?.id);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddWithdrawMethod, setShowAddWithdrawMethod] = useState(false);
  const [depositOptions, setDepositOptions] = useState<DepositOptionsResponse | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState<any>(null);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [savingMethod, setSavingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState<"CRYPTO_EXTERNAL" | "BANK_TRANSFER">("BANK_TRANSFER");
  const [newMethodFields, setNewMethodFields] = useState({
    tron_usdt_address: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);

  const tgUser = typeof window !== "undefined" ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user : null;

  const vipTier = vipData?.currentTier || "BRONZE";
  const vipLevel = vipData?.currentVipLevel || 1;

  useEffect(() => {
    if (!isLoggedIn) return;
    setActiveModule("profile");
  }, [isLoggedIn]);

  useEffect(() => {
    if (tgUser) {
      setPersonalInfo({
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
        phone: tgUser.phone_number || "",
        email: "",
      });
    } else if (user) {
      setPersonalInfo({
        first_name: user.telegram_username || "",
        last_name: "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [tgUser, user, isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingMethods(true);
      try {
        const [depositOpts, withdrawOpt, notifs, unread] = await Promise.all([
          walletApi.getDepositOptions(),
          walletApi.getWithdrawalMethod(),
          notificationApi.getMyNotifications(10, 0, false),
          notificationApi.getUnreadCount(),
        ]);
        setDepositOptions(depositOpts);
        setWithdrawMethod(withdrawOpt);
        setNotifications(notifs.notifications || []);
        setUnreadCount(unread.unread_count || 0);
      } catch (error: any) {
        const status = error.response?.status;
        if (status && status !== 401 && status !== 403) {
          console.error("Failed to fetch profile data:", error);
        }
      } finally {
        setLoadingMethods(false);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfileImage(true);
    try {
      const result = await authApi.uploadProfileImage(file);
      setUser({ ...user, profile_image_url: result.profile_image_url });
    } catch (err: any) {
      console.error("Failed to upload profile image:", err);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getNetworkIcon = (network: string) => {
    if (network.includes("BSC") || network.includes("BEP20")) return "🟡";
    if (network.includes("TRON") || network.includes("TRC20")) return "🔴";
    if (network.includes("BTC")) return "🟠";
    return "💰";
  };

  const getBankIcon = (bankName: string) => {
    if (bankName.toLowerCase().includes("palmpay")) return "🟢";
    if (bankName.toLowerCase().includes("moniepoint")) return "🔵";
    return "🏦";
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Profile</h1>
              <p className="text-[10px] text-slate-400">Account settings & wallet methods</p>
            </div>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <button
                  onClick={async () => {
                    try {
                      await notificationApi.markAllAsRead();
                      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                      setUnreadCount(0);
                    } catch (err: any) {
                      console.error("Failed to mark all as read:", err);
                    }
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  Mark all read
                </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border ${notif.is_read ? "bg-slate-950/60 border-slate-800" : "bg-indigo-500/5 border-indigo-500/20"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white">{notif.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                        {!notif.is_read && (
                          <button
                            onClick={async () => {
                              try {
                                await notificationApi.markAsRead(notif.id);
                                setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              } catch (err: any) {
                                console.error("Failed to mark notification as read:", err);
                              }
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 ml-2"
                          >
                            Mark read
                          </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden relative">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <User size={28} className="text-indigo-400" />
                  <span className="text-[8px] text-indigo-400/70 mt-0.5">No photo</span>
                </div>
              )}
              <button
                onClick={() => profileImageRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={16} className="text-white" />
              </button>
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">
                {user?.telegram_username || "User"}
              </h2>
              <p className="text-xs text-slate-400">
                {user?.email || "No email"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {vipTier}
                </span>
                <span className="text-[10px] text-slate-400">Level {vipLevel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
              <Flame size={16} className="text-orange-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{wallet?.streak_count || 0}</p>
              <p className="text-[10px] text-slate-400">Streak</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
              <TrendingUp size={16} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{wallet?.total_trades || 0}</p>
              <p className="text-[10px] text-slate-400">Trades</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
              <Wallet size={16} className="text-cyan-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">${(wallet?.available_balance_usdt || 0).toFixed(2)}</p>
              <p className="text-[10px] text-slate-400">Balance</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Balance</h3>
            <Crown size={16} className="text-amber-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">USDT</p>
                <p className="text-sm font-bold text-white">${(wallet?.available_balance_usdt || 0).toFixed(2)}</p>
              </div>
              <button
                onClick={() => setShowDeposit(true)}
                className="px-3 py-1.5 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-all"
              >
                Deposit
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Tcoin</p>
                <p className="text-sm font-bold text-amber-400">{wallet?.tcoin_balance?.toFixed(2) || "0.00"}</p>
              </div>
              <button
                onClick={() => setShowWithdraw(true)}
                className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-lg hover:bg-rose-400 transition-all"
              >
                Withdraw
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">CRED</p>
                <p className="text-sm font-bold text-blue-400">{wallet?.cred_balance?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">NGN</p>
                <p className="text-sm font-bold text-emerald-400">₦{(wallet?.ngn_balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Withdrawal Method</h3>
            <button
              onClick={() => setShowAddWithdrawMethod(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {!withdrawMethod ? (
              <p className="text-xs text-slate-500 text-center py-4">No withdrawal method set.</p>
            ) : (
              <>
                {withdrawMethod.tron_usdt_address && (
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                        💳
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">USDT TRC20</p>
                        <p className="text-[10px] text-slate-400 font-mono">{withdrawMethod.tron_usdt_address}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                )}
                {withdrawMethod.bank_name && (
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                        🏦
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{withdrawMethod.bank_name}</p>
                        <p className="text-[10px] text-slate-400">{withdrawMethod.bank_account_number}</p>
                        <p className="text-[10px] text-slate-500">{withdrawMethod.bank_account_name}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
          <div className="space-y-2">
            <button
              onClick={() => setEditingPersonalInfo(true)}
              className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                <span className="text-xs text-slate-300">Personal Information</span>
              </div>
              <ChevronRight size={14} className="text-slate-500" />
            </button>
            <button
              onClick={() => router.push("/profile-customization")}
              className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-slate-400" />
                <span className="text-xs text-slate-300">Payment Methods</span>
              </div>
              <ChevronRight size={14} className="text-slate-500" />
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-slate-400" />
                <span className="text-xs text-slate-300">Settings</span>
              </div>
              <ChevronRight size={14} className="text-slate-500" />
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-bold">Admin Portal</span>
                </div>
                <ChevronRight size={14} className="text-emerald-500" />
              </button>
            )}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                }
                router.push("/auth");
              }}
              className="w-full flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-rose-900/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="text-rose-400" />
                <span className="text-xs text-rose-400">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {showDeposit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Deposit</h3>
            <div className="space-y-4">
              {depositOptions?.crypto_options && depositOptions.crypto_options.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Crypto</h4>
                  <div className="space-y-2">
                    {depositOptions.crypto_options.map((option: CryptoDepositOption, idx: number) => (
                      <button
                        key={`crypto-${idx}`}
                        onClick={() => copyToClipboard(option.deposit_address)}
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getNetworkIcon(option.network)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{option.token}</p>
                            <p className="text-xs text-slate-400">{option.network}</p>
                            <p className="text-xs text-slate-300 font-mono mt-1 break-all">
                              {option.deposit_address}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {copiedAddress === option.deposit_address ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <Copy size={16} className="text-slate-400" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {depositOptions?.paystack_public_key && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Paystack (NGN)</h4>
                    <button
                    onClick={async () => {
                      try {
                        const amountStr = prompt("Enter amount in NGN:");
                        if (!amountStr) return;
                        const amount = parseFloat(amountStr);
                        if (isNaN(amount) || amount <= 0) {
                          alert("Please enter a valid amount.");
                          return;
                        }
                        const res = await walletApi.initializePaystackDeposit({
                          amount_ngn: amount,
                          email: user?.email || undefined,
                        });
                        window.location.href = res.authorization_url;
                      } catch (err: any) {
                        alert(err.response?.data?.detail || "Failed to initialize Paystack payment.");
                      }
                    }}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">💳</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Pay with Paystack</p>
                      <p className="text-xs text-slate-400">Quick and secure card/bank payment</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-400" />
                  </button>
                </div>
              )}

              {depositOptions?.bank_accounts && depositOptions.bank_accounts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Bank Transfer (NGN)</h4>
                  <div className="space-y-2">
                    {depositOptions.bank_accounts.map((account: BankDepositOption, idx: number) => (
                      <button
                        key={`bank-${idx}`}
                        onClick={() => copyToClipboard(account.account_number)}
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getBankIcon(account.bank_name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{account.bank_name}</p>
                            <p className="text-xs text-slate-300 font-mono">{account.account_number}</p>
                            <p className="text-xs text-slate-500">{account.account_name}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {copiedAddress === account.account_number ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <Copy size={16} className="text-slate-400" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {depositOptions?.contact_details && depositOptions.contact_details.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Contact for Confirmation</h4>
                  <div className="space-y-2">
                    {depositOptions.contact_details.map((detail, idx) => (
                      <div key={`contact-${idx}`} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <p className="text-xs text-slate-300 break-all">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!depositOptions?.crypto_options?.length && !depositOptions?.paystack_public_key && !depositOptions?.bank_accounts?.length && !(depositOptions?.contact_details?.length)) && (
                <p className="text-xs text-slate-500 text-center py-4">No deposit methods available.</p>
              )}
            </div>
            <button
              onClick={() => setShowDeposit(false)}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Withdraw</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount (USDT)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Withdrawal Method</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-rose-500">
                  {withdrawMethod?.tron_usdt_address && (
                    <option value="crypto">USDT TRC20</option>
                  )}
                  {withdrawMethod?.bank_name && (
                    <option value="bank">{withdrawMethod.bank_name}</option>
                  )}
                  {!withdrawMethod && <option value="">No methods available</option>}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Withdrawal request submitted!");
                  setShowWithdraw(false);
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/20"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddWithdrawMethod && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Add Withdrawal Method</h3>
            <p className="text-[10px] text-slate-400 mb-4">
              Your withdrawal method will be locked after the first withdrawal. Contact support to change it.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Method Type</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value as "CRYPTO_EXTERNAL" | "BANK_TRANSFER")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NGN / USD)</option>
                  <option value="CRYPTO_EXTERNAL">USDT TRC20</option>
                </select>
              </div>

              {newMethod === "BANK_TRANSFER" ? (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bank Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={newMethodFields.bank_name}
                      onChange={(e) => setNewMethodFields({ ...newMethodFields, bank_name: e.target.value })}
                      placeholder="e.g. Palmpay, Moniepoint, GTBank"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Account Number <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newMethodFields.bank_account_number}
                      onChange={(e) => setNewMethodFields({ ...newMethodFields, bank_account_number: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                      placeholder="10-12 digit account number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Account Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={newMethodFields.bank_account_name}
                      onChange={(e) => setNewMethodFields({ ...newMethodFields, bank_account_name: e.target.value })}
                      placeholder="Full name on the bank account"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">USDT TRC20 Wallet Address <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={newMethodFields.tron_usdt_address}
                    onChange={(e) => setNewMethodFields({ ...newMethodFields, tron_usdt_address: e.target.value })}
                    placeholder="T... TRC20 address"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setShowAddWithdrawMethod(false);
                  setNewMethodFields({ tron_usdt_address: "", bank_name: "", bank_account_number: "", bank_account_name: "" });
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newMethod === "BANK_TRANSFER") {
                    if (!newMethodFields.bank_name || !newMethodFields.bank_account_number || !newMethodFields.bank_account_name) {
                      alert("Please fill in bank name, account number, and account name.");
                      return;
                    }
                    if (newMethodFields.bank_account_number.length < 10) {
                      alert("Account number must be at least 10 digits.");
                      return;
                    }
                    if (newMethodFields.bank_account_name.trim().length < 3) {
                      alert("Please enter a valid account name.");
                      return;
                    }
                  } else {
                    if (!newMethodFields.tron_usdt_address || newMethodFields.tron_usdt_address.length < 20) {
                      alert("Please enter a valid TRC20 address (at least 20 characters).");
                      return;
                    }
                  }
                  setSavingMethod(true);
                  try {
                    await walletApi.setWithdrawalMethod({
                      method: newMethod,
                      tron_usdt_address: newMethod === "CRYPTO_EXTERNAL" ? newMethodFields.tron_usdt_address : undefined,
                      bank_name: newMethod === "BANK_TRANSFER" ? newMethodFields.bank_name : undefined,
                      bank_account_number: newMethod === "BANK_TRANSFER" ? newMethodFields.bank_account_number : undefined,
                      bank_account_name: newMethod === "BANK_TRANSFER" ? newMethodFields.bank_account_name : undefined,
                    });
                    const updated = await walletApi.getWithdrawalMethod();
                    setWithdrawMethod(updated);
                    setNewMethodFields({ tron_usdt_address: "", bank_name: "", bank_account_number: "", bank_account_name: "" });
                    setShowAddWithdrawMethod(false);
                  } catch (err: any) {
                    alert(err.response?.data?.detail || "Failed to save withdrawal method.");
                  } finally {
                    setSavingMethod(false);
                  }
                }}
                disabled={savingMethod}
                className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl"
              >
                {savingMethod ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPersonalInfo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">First Name</label>
                <input
                  type="text"
                  value={personalInfo.first_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, first_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={personalInfo.last_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, last_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Telegram ID</label>
                <input
                  type="text"
                  value={tgUser?.id || user?.id || "N/A"}
                  disabled
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingPersonalInfo(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Personal information updated!");
                  setEditingPersonalInfo(false);
                }}
                className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
