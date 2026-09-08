"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/api";
import { getTelegramUser, triggerHaptic } from "@/lib/telegram";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { VipStatusSection } from "@/components/dashboard/VipStatusSection";
import { WalletModal } from "@/components/wallet/WalletModal";
import { BottomNav } from "@/components/BottomNav";
import { SignalCard } from "@/components/SignalCard";
import { ActivityItem } from "@/lib/types";
import { Wallet, TrendingUp, Gamepad2, Target, Trophy, Clock, ArrowDownLeft, UploadCloud, ExternalLink } from "lucide-react";
import { walletApi, DepositHistoryItem } from "@/api/walletApi";

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, signals, trades, quests, tournaments, setWallet, setSignals, setTrades, setQuests, setTournaments, addActivity, isLoading, setLoading, activeModule, setActiveModule } = useAppStore();
  const { user: authUser } = useAuth();
  const [showWallet, setShowWallet] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<DepositHistoryItem[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [showDepositProof, setShowDepositProof] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const tgUser = getTelegramUser();

  useEffect(() => {
    const isLoggedIn = authUser || tgUser?.id;
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }

    setActiveModule("dashboard");

    const init = async () => {
      setLoading(true);
      try {
        let currentUserId = authUser?.id;

        if (!currentUserId && tgUser?.id) {
          const { data: user } = await supabase
            .from("users")
            .select("id, user_virtual_wallets(*)")
            .eq("telegram_id", tgUser.id)
            .single();

          if (user?.user_virtual_wallets && user.user_virtual_wallets.length > 0) {
            setWallet(user.user_virtual_wallets[0]);
          }
          currentUserId = user?.id || undefined;
        } else if (authUser?.id) {
          const { data: user } = await supabase
            .from("users")
            .select("id, user_virtual_wallets(*)")
            .eq("id", authUser.id)
            .single();

          if (user?.user_virtual_wallets && user.user_virtual_wallets.length > 0) {
            setWallet(user.user_virtual_wallets[0]);
          }
          currentUserId = authUser.id;
        }

        if (currentUserId) {
          setUserId(currentUserId);
        }

        const { data: signalsData } = await supabase
          .from("trading_signals")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false })
          .limit(10);

        if (signalsData) setSignals(signalsData);

        const { data: tradesData } = await supabase
          .from("internal_user_trades")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (tradesData) setTrades(tradesData);

        const { data: questsData } = await supabase
          .from("tasks_and_quests")
          .select("*")
          .eq("is_active", true)
          .limit(10);

        if (questsData) setQuests(questsData);

        const { data: tournamentsData } = await supabase
          .from("tournaments")
          .select("*")
          .neq("status", "ENDED")
          .order("start_time", { ascending: false })
          .limit(5);

        if (tournamentsData) setTournaments(tournamentsData);

        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

        if (currentUserId && token) {
          try {
            const depositsData = await walletApi.getDepositHistory(20, 0);
            setDeposits(depositsData);
          } catch (error: any) {
            const status = error.response?.status;
            if (status && status !== 401 && status !== 403) {
              console.error("Failed to fetch deposit history:", error);
            }
          }
        }
      } catch (error) {
        console.error("Dashboard init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [tgUser?.id, authUser?.id]);

  const totalNetWorth = wallet ? wallet.available_balance_usdt + wallet.locked_margin_usdt + wallet.platform_credits + (wallet.tcoin_balance || 0) * 0.0333 + (wallet.cred_balance || 0) * 0.0333 : 0;
  const lifetimeEarnings = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const winRate = trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <BalanceCard
          usdtBalance={wallet?.available_balance_usdt || 0}
          tcoinBalance={wallet?.tcoin_balance || 0}
          onAddFunds={() => {
            triggerHaptic("light");
            setShowWallet(true);
          }}
          onInviteFriends={() => triggerHaptic("light")}
          onActivateVip={() => {
            triggerHaptic("light");
            router.push("/vip");
          }}
        />

        <FeatureGrid />

        <ReferralCard referralCode={tgUser?.id ? `user${tgUser.id.toString().slice(-6)}` : authUser?.username || "user"} />

        <VipStatusSection userId={userId || undefined} onUpgradeClick={() => router.push("/vip")} />

        <section className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={14} className="text-cyan-400" />
                <span className="text-[10px] text-slate-400">Net Worth</span>
              </div>
              <p className="text-lg font-bold text-white">${totalNetWorth.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500">USDT</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-[10px] text-slate-400">Lifetime PnL</span>
              </div>
              <p className={`text-lg font-bold ${lifetimeEarnings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {lifetimeEarnings >= 0 ? "+" : ""}${lifetimeEarnings.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">Realized</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 size={14} className="text-purple-400" />
                <span className="text-[10px] text-slate-400">Earnpoly Stakes</span>
              </div>
              <p className="text-lg font-bold text-white">${wallet?.locked_margin_usdt?.toFixed(2) || "0.00"}</p>
              <p className="text-[10px] text-slate-500">Locked</p>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-amber-400" />
                <span className="text-[10px] text-slate-400">Signal Win Rate</span>
              </div>
              <p className="text-lg font-bold text-white">{winRate.toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500">{trades.length} trades</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Stream</h2>
            <Clock size={14} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            {useAppStore.getState().activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No activity yet. Start trading or playing!</p>
            ) : (
              useAppStore.getState().activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{activity.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount !== undefined && (
                      <p className={`text-xs font-bold ${activity.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {activity.amount >= 0 ? "+" : ""}${activity.amount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deposit History</h2>
            <ArrowDownLeft size={14} className="text-emerald-500" />
          </div>
          {loadingDeposits ? (
            <p className="text-xs text-slate-500 text-center py-4">Loading deposits...</p>
          ) : deposits.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No deposits yet. Fund your account to start trading!</p>
          ) : (
            <div className="space-y-2">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{deposit.currency}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">{deposit.method.replace("_", " ")}</span>
                    </div>
                    <span className={`text-xs font-bold ${deposit.status === "COMPLETED" ? "text-emerald-400" : deposit.status === "PENDING" ? "text-amber-400" : "text-rose-400"}`}>
                      {deposit.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Amount: {deposit.amount} {deposit.currency}</span>
                    <span>Net: {deposit.net_amount} {deposit.currency}</span>
                  </div>
                  {deposit.assigned_address && (
                    <div className="mt-1 text-[10px] text-slate-500 font-mono truncate">
                      Address: {deposit.assigned_address}
                    </div>
                  )}
                  {deposit.bank_name && (
                    <div className="mt-1 text-[10px] text-slate-500">
                      Bank: {deposit.bank_name} • {deposit.account_number}
                    </div>
                  )}
                  {deposit.tx_hash && (
                    <div className="mt-1 text-[10px] text-slate-500 font-mono truncate">
                      TX: {deposit.tx_hash}
                    </div>
                  )}
                  {deposit.payment_proof_url && (
                    <div className="mt-1">
                      <a href={deposit.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1">
                        <ExternalLink size={10} /> View Proof
                      </a>
                    </div>
                  )}
                  {deposit.status === "PENDING" && !deposit.payment_proof_url && (
                    <button
                      onClick={() => {
                        setSelectedDepositId(deposit.id);
                        setShowDepositProof(true);
                      }}
                      className="mt-2 w-full py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1"
                    >
                      <UploadCloud size={12} />
                      Upload Payment Proof
                    </button>
                  )}
                  {deposit.admin_note && (
                    <div className="mt-1 text-[10px] text-amber-400">
                      Note: {deposit.admin_note}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-slate-500">
                    {new Date(deposit.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showDepositProof && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-white mb-4">Upload Payment Proof</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Proof URL (image/cloud link)</label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transaction Hash (optional)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowDepositProof(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!proofUrl) return;
                    try {
                      await walletApi.uploadDepositProof({
                        deposit_id: selectedDepositId,
                        proof_url: proofUrl,
                        tx_hash: txHash || undefined,
                      });
                      setShowDepositProof(false);
                      setProofUrl("");
                      setTxHash("");
                      const updated = await walletApi.getDepositHistory(20, 0);
                      setDeposits(updated);
                    } catch (err: any) {
                      alert(err.response?.data?.detail || "Failed to upload proof");
                    }
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tournaments</h2>
            <Trophy size={14} className="text-amber-400" />
          </div>
          {tournaments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No active tournaments.</p>
          ) : (
            <div className="space-y-2">
              {tournaments.map((t) => (
                <div key={t.id} className="glass-card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.type.replace("_", " ")} • {t.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">${t.prize_pool_usdt.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">Prize Pool</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Signals</h2>
          {signals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No active signals right now.</p>
          ) : (
            signals.slice(0, 3).map((sig) => (
              <SignalCard
                key={sig.id}
                signal={sig}
                userId={userId || ""}
                onSuccess={() => window.location.reload()}
              />
            ))
          )}
        </section>
      </main>

      <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />

      <BottomNav />
    </div>
  );
}
