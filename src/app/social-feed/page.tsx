"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { socialApi, EarningFeedEntry } from "@/api/socialApi";
import { Heart, Flame, Hand, Rocket, TrendingUp, Gift, Share2, Filter } from "lucide-react";

const REACTION_MAP: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  LIKE: { icon: Heart, color: "text-rose-400", label: "Like" },
  FIRE: { icon: Flame, color: "text-orange-400", label: "Fire" },
  CLAP: { icon: Hand, color: "text-amber-400", label: "Clap" },
  ROCKET: { icon: Rocket, color: "text-indigo-400", label: "Rocket" },
};

export default function SocialFeedPage() {
  const { setActiveModule } = useAppStore();
  const [feed, setFeed] = useState<EarningFeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("social-feed");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await socialApi.getFeed();
        setFeed(data);
      } catch (error) {
        console.error("Failed to fetch feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleReaction = async (entryId: string, reactionType: string) => {
    try {
      await socialApi.addReaction(entryId, reactionType);
      setFeed((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, user_reaction: reactionType, reaction_count: (entry.reaction_count || 0) + 1 }
            : entry
        )
      );
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const filteredFeed = filter === "ALL" ? feed : feed.filter((entry) => entry.event_type === filter);

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
              <h1 className="text-base font-bold text-white leading-tight">Earning Feed</h1>
              <p className="text-[10px] text-gray-400">See what the community is earning</p>
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {["ALL", "TASK_COMPLETED", "BIG_PAYOUT", "GUILD_WAR_WIN", "EARN_POLY_WIN", "REFERRAL_BONUS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {f === "ALL" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>

        {filteredFeed.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No feed entries yet. Be the first to share!</p>
          </div>
        ) : (
          filteredFeed.map((entry) => (
            <div key={entry.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                    {(entry.username || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{entry.username || "Anonymous"}</p>
                    <p className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                {entry.amount && entry.currency && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">
                      +{entry.currency === "TCOIN" ? `${entry.amount.toFixed(2)} TC` : `$${entry.amount.toFixed(2)}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
                {entry.description && <p className="text-xs text-slate-400 mt-1">{entry.description}</p>}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {Object.entries(REACTION_MAP).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(entry.id, type)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        entry.user_reaction === type
                          ? `${config.color} bg-slate-800 border border-slate-700`
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Icon size={12} />
                      {config.label}
                    </button>
                  );
                })}
                <span className="ml-auto text-[10px] text-slate-500">
                  {entry.reaction_count || 0} reactions
                </span>
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
