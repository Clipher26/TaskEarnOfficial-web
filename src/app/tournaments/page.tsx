"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { tournamentsApi } from "@/api/tournamentsApi";
import { MiniTournament } from "@/lib/types";
import { Trophy, Users, Zap, Swords } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function TournamentsPage() {
  const { setActiveModule, activeTournaments, setActiveTournaments } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("tournaments");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await tournamentsApi.listTournaments();
        setActiveTournaments(res.tournaments);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setActiveTournaments]);

  const handleJoin = async (tournamentId: string) => {
    setJoining(tournamentId);
    try {
      await tournamentsApi.joinTournament(tournamentId);
      const res = await tournamentsApi.listTournaments();
      setActiveTournaments(res.tournaments);
    } catch (error) {
      console.error("Failed to join tournament:", error);
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
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
          <h1 className="text-lg font-bold text-white">Tournaments</h1>
          <p className="text-[10px] text-slate-400">Weekly 1v1 arcade games with TCoin prizes</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {activeTournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No active tournaments</p>
            <p className="text-xs text-slate-500 mt-1">Check back later for new competitions!</p>
          </div>
        ) : (
          activeTournaments.map((tournament) => (
            <div key={tournament.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Swords size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">{tournament.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{tournament.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize">{tournament.game_type.replace("_", " ")}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    tournament.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : tournament.status === "UPCOMING"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {tournament.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                  <Zap size={12} className="text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">Entry</p>
                  <p className="text-xs font-bold text-white">{tournament.entry_fee_tcoin}</p>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                  <Trophy size={12} className="text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">Prize Pool</p>
                  <p className="text-xs font-bold text-white">{tournament.prize_pool_tcoin}</p>
                </div>
                <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                  <Users size={12} className="text-indigo-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">Players</p>
                  <p className="text-xs font-bold text-white">{tournament.current_players}/{tournament.max_players}</p>
                </div>
              </div>

              {tournament.can_join && (
                <button
                  onClick={() => handleJoin(tournament.id)}
                  disabled={joining === tournament.id}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {joining === tournament.id ? "Joining..." : "Join Tournament"}
                </button>
              )}
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
