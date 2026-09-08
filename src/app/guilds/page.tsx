"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Users, Crown, Shield, Plus, Trophy, Swords, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { socialApi } from "@/api/socialApi";

function getTimeLeft(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  if (diff <= 0) return "0d 0h 0m";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
}

export default function GuildsPage() {
  const { setActiveModule, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<"my_guild" | "browse" | "battles">("my_guild");
  const [myGuild, setMyGuild] = useState<any>(null);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [battles, setBattles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("guilds");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [myGuildData, guildsData, warsData] = await Promise.all([
          socialApi.getMyGuild(),
          socialApi.getGuilds(),
          socialApi.getGuildWars(),
        ]);
        setMyGuild(myGuildData);
        setGuilds(guildsData);
        setBattles(warsData || []);
        if (myGuildData?.id) {
          const membersData = await socialApi.getGuildMembers(myGuildData.id);
          setMembers(membersData || []);
        }
      } catch (error) {
        console.error("Failed to fetch guild data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Guilds</h1>
              <p className="text-[10px] text-slate-400">Squad battles & social growth</p>
            </div>
            <button className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {(["my_guild", "browse", "battles"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-2 rounded-lg text-[10px] font-medium transition-all
                ${activeTab === tab
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-300"
                }
              `}
            >
              {tab === "my_guild" ? "My Guild" : tab === "browse" ? "Browse" : "Battles"}
            </button>
          ))}
        </div>

        {activeTab === "my_guild" && (
          <div className="space-y-3">
            {myGuild ? (
              <>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Users size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{myGuild.name}</h2>
                      <p className="text-xs text-slate-400">{myGuild.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Members</p>
                      <p className="text-lg font-bold text-white">{myGuild.members}/50</p>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Monthly XP</p>
                      <p className="text-lg font-bold text-emerald-400">{myGuild.monthly_xp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={14} className="text-amber-400" />
                    <span className="text-xs text-slate-300">Leader: {myGuild.leader}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-indigo-400" />
                    <span className="text-xs text-slate-300">Your Role: {myGuild.role}</span>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Members</h3>
                  <div className="space-y-2">
                    {members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                            {member.user?.telegram_username?.[0] || member.user?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{member.user?.telegram_username || member.user?.full_name || "User"}</p>
                            <p className="text-[10px] text-slate-400">{member.role || "MEMBER"}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-400">{member.xp_contributed || 0} XP</span>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-2">No members yet</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">You haven't joined a guild yet.</p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-3 px-6 py-2 bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  Browse Guilds
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "browse" && (
          <div className="space-y-3">
            {guilds.map((guild) => (
              <div key={guild.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{guild.name}</h3>
                    <p className="text-[10px] text-slate-400">{guild.member_count || 0}/{guild.max_members || 50} members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{(guild.total_xp || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">total XP</p>
                  </div>
                </div>
                <button
                  disabled={guild.user_role === "MEMBER" || guild.user_role === "OFFICER" || guild.user_role === "LEADER"}
                  className={`
                    w-full py-2 rounded-xl text-xs font-bold transition-all
                    ${guild.user_role ? "bg-slate-800 text-slate-500" : "bg-indigo-500 hover:bg-indigo-400 text-white"}
                  `}
                >
                  {guild.user_role ? "Joined" : "Join Guild"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "battles" && (
          <div className="space-y-3">
            {battles.map((battle) => {
              const endDate = battle.end_date ? new Date(battle.end_date) : null;
              const now = new Date();
              const isActive = battle.status === "ACTIVE" && endDate && endDate > now;
              const timeLeft = endDate ? getTimeLeft(endDate) : null;

              return (
                <div key={battle.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{battle.title}</h3>
                      <p className="text-[10px] text-slate-400">
                        {isActive ? (timeLeft ? `Ends in ${timeLeft}` : "Active") : battle.status === "PENDING" ? "Upcoming" : "Completed"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">${(battle.prize_pool || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500">prize pool</p>
                    </div>
                  </div>
                  <button
                    disabled={!isActive}
                    className={`
                      w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
                      ${isActive ? "bg-rose-500 hover:bg-rose-400 text-white" : "bg-slate-800 text-slate-500"}
                    `}
                  >
                    <Swords size={14} />
                    {isActive ? "Join Battle" : battle.status === "PENDING" ? "Upcoming" : "Completed"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
