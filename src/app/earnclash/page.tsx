"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { earnclashApi, EarnClashRoom } from "@/api/earnclashApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Trophy, Users, Zap, Swords, Plus, Play, X, Crown, Lock } from "lucide-react";

const TIER_ORDER = ["FREE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE_TRADER"];

function hasMinTier(userTier: string, minTier: string): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier);
  const minIdx = TIER_ORDER.indexOf(minTier);
  return userIdx >= minIdx;
}

export default function EarnclashPage() {
  const { setActiveModule, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<EarnClashRoom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  const vipTier = user?.vip_tier || "FREE";
  const canAccess = hasMinTier(vipTier, "GOLD");

  const [newRoom, setNewRoom] = useState({
    name: "",
    game_mode: "QUICK_MATCH" as any,
    stake_amount: 0,
    stake_currency: "TCOIN",
    max_players: 2,
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnclash");
  }, [isLoggedIn, isLoading, setActiveModule]);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await earnclashApi.listRooms(undefined, "WAITING");
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canAccess]);

  const handleCreate = async () => {
    try {
      await earnclashApi.createRoom(newRoom);
      setShowCreateModal(false);
      setNewRoom({
        name: "",
        game_mode: "QUICK_MATCH",
        stake_amount: 0,
        stake_currency: "TCOIN",
        max_players: 2,
      });
      const data = await earnclashApi.listRooms(undefined, "WAITING");
      setRooms(data);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoin = async (roomId: string) => {
    setJoining(roomId);
    try {
      await earnclashApi.joinRoom(roomId);
      window.location.href = `/earnclash/room/${roomId}`;
    } catch (error) {
      console.error("Failed to join room:", error);
      setJoining(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "IN_PROGRESS":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "FINISHED":
        return "bg-slate-800 text-slate-400 border border-slate-700";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">EarnClash</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Lock size={32} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Gold Tier Required</h2>
          <p className="text-sm text-slate-400 mb-4">Upgrade to Gold VIP to unlock EarnClash competitive PvP battles.</p>
          <button
            onClick={() => window.location.href = "/vip"}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Crown size={16} />
            View VIP Tiers
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">EarnClash</h1>
            <p className="text-[10px] text-slate-400">PvP gaming with real stakes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <Swords size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No open rooms</p>
            <p className="text-xs text-slate-500 mt-1">Create a room to start playing!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Swords size={16} className="text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">{room.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 capitalize">{room.game_mode.replace("_", " ")}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Zap size={12} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Stake</p>
                    <p className="text-xs font-bold text-white">{room.stake_amount} {room.stake_currency}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Users size={12} className="text-indigo-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Players</p>
                    <p className="text-xs font-bold text-white">{room.current_players}/{room.max_players}</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Trophy size={12} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Prize</p>
                    <p className="text-xs font-bold text-white">{room.stake_amount * room.max_players} {room.stake_currency}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(room.id)}
                  disabled={joining === room.id || room.current_players >= room.max_players}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joining === room.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : room.current_players >= room.max_players ? (
                    "Room Full"
                  ) : (
                    <>
                      <Play size={14} />
                      Join Room
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Create Room</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Enter room name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Game Mode</label>
                <select
                  value={newRoom.game_mode}
                  onChange={(e) => setNewRoom({ ...newRoom, game_mode: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="QUICK_MATCH">Quick Match</option>
                  <option value="RANKED">Ranked</option>
                  <option value="CLASSIC">Classic</option>
                  <option value="TOURNAMENT">Tournament</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Stake Amount</label>
                <input
                  type="number"
                  value={newRoom.stake_amount}
                  onChange={(e) => setNewRoom({ ...newRoom, stake_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Players</label>
                <select
                  value={newRoom.max_players}
                  onChange={(e) => setNewRoom({ ...newRoom, max_players: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value={2}>2 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={16}>16 Players</option>
                </select>
              </div>
              <button
                onClick={handleCreate}
                disabled={!newRoom.name}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
