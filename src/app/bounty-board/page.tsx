"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { socialApi, BountyBoardEntry } from "@/api/socialApi";
import { Plus, CheckCircle2, Clock, AlertCircle, ExternalLink, XCircle } from "lucide-react";

export default function BountyBoardPage() {
  const { setActiveModule } = useAppStore();
  const [bounties, setBounties] = useState<BountyBoardEntry[]>([]);
  const [myBounties, setMyBounties] = useState<BountyBoardEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "my_bounties">("browse");
  const { isLoggedIn, isLoading } = useRequireAuth();

  const [form, setForm] = useState({ title: "", description: "", reward_amount: 10, reward_currency: "TCOIN", max_completions: 10, task_url: "" });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("bounty-board");
    fetchBounties();
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (tab === "my_bounties" && isLoggedIn) {
      fetchMyBounties();
    }
  }, [tab]);

  const fetchBounties = async () => {
    try {
      const data = await socialApi.getBounties("ACTIVE");
      setBounties(data);
    } catch (error) {
      console.error("Failed to fetch bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBounties = async () => {
    try {
      const data = await socialApi.getBounties();
      setMyBounties(data);
    } catch (error) {
      console.error("Failed to fetch my bounties:", error);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await socialApi.createBounty({
        title: form.title,
        description: form.description,
        reward_amount: form.reward_amount,
        reward_currency: form.reward_currency,
        max_completions: form.max_completions,
        task_url: form.task_url || undefined,
      });
      setShowCreate(false);
      setForm({ title: "", description: "", reward_amount: 10, reward_currency: "TCOIN", max_completions: 10, task_url: "" });
      fetchBounties();
    } catch (error) {
      console.error("Failed to create bounty:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Bounty Board</h1>
              <p className="text-[10px] text-gray-400">Post mini-tasks for the community</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {(["browse", "my_bounties"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                tab === t
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {t === "browse" ? "Browse" : "My Bounties"}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <div className="space-y-3">
            {bounties.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No active bounties right now.</p>
              </div>
            ) : (
              bounties.map((bounty) => (
                <div key={bounty.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{bounty.title}</h3>
                      <p className="text-[10px] text-slate-400">by {bounty.poster_username || "Anonymous"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{bounty.reward_amount}</p>
                      <p className="text-[10px] text-slate-500">{bounty.reward_currency}</p>
                    </div>
                  </div>
                  {bounty.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{bounty.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock size={10} />
                      <span>{bounty.completions}/{bounty.max_completions || "∞"} completed</span>
                    </div>
                    {bounty.task_url && (
                      <a href={bounty.task_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 flex items-center gap-1">
                        <ExternalLink size={10} /> Open Task
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "my_bounties" && (
          <div className="space-y-3">
            {myBounties.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">You haven't posted any bounties yet.</p>
              </div>
            ) : (
              myBounties.map((bounty) => (
                <div key={bounty.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{bounty.title}</h3>
                      <p className="text-[10px] text-slate-400">{new Date(bounty.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {bounty.status === "ACTIVE" && <CheckCircle2 size={14} className="text-emerald-400" />}
                      {bounty.status === "PENDING" && <Clock size={14} className="text-amber-400" />}
                      {bounty.status === "REJECTED" && <XCircle size={14} className="text-rose-400" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      bounty.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" :
                      bounty.status === "PENDING" ? "bg-amber-500/10 text-amber-400" :
                      bounty.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" :
                      "bg-slate-500/10 text-slate-400"
                    }`}>{bounty.status}</span>
                    <span className="text-[10px] text-slate-500">{bounty.completions}/{bounty.max_completions || "∞"} completed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm">
              <h2 className="text-base font-bold text-white mb-4">Create Bounty</h2>
              <form onSubmit={handleCreateBounty} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Reward</label>
                    <input
                      type="number"
                      value={form.reward_amount}
                      onChange={(e) => setForm({ ...form, reward_amount: Number(e.target.value) })}
                      min="1"
                      required
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Max Completions</label>
                    <input
                      type="number"
                      value={form.max_completions}
                      onChange={(e) => setForm({ ...form, max_completions: Number(e.target.value) })}
                      min="1"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Task URL (optional)</label>
                  <input
                    type="url"
                    value={form.task_url}
                    onChange={(e) => setForm({ ...form, task_url: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400">
                    Post Bounty
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
