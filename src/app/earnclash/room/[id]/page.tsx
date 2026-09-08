"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { earnclashApi, EarnClashRoomDetail, EarnClashPlayer, MatchResult } from "@/api/earnclashApi";
import { BottomNav } from "@/components/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/context/AuthContext";
import {
  Swords,
  Trophy,
  Users,
  Loader2,
  Play,
  X,
  CheckCircle2,
  XCircle,
  Zap,
  Crown,
} from "lucide-react";

export default function EarnclashRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  const { isLoggedIn, isLoading } = useRequireAuth();

  if (!roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-slate-400">Invalid room ID</p>
      </div>
    );
  }

  const [room, setRoom] = useState<EarnClashRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/auth");
      return;
    }
    if (!roomId) return;
    fetchRoom();
  }, [roomId, isLoggedIn, isLoading]);

  const fetchRoom = async () => {
    if (!roomId) return;
    try {
      const data = await earnclashApi.getRoom(roomId);
      setRoom(data);
    } catch (error) {
      console.error("Failed to fetch room:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    if (typeof window === "undefined") return;
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:8000/ws/v1/earnclash/match/${roomId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnected(true);
      setWs(socket);
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "state_update") {
          setRoom(data.payload);
        } else if (data.type === "match_start") {
          setRoom((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : null);
        } else if (data.type === "match_finish") {
          setRoom((prev) => prev ? { ...prev, status: "FINISHED" } : null);
        }
      } catch (error) {
        console.error("Failed to parse WS message:", error);
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  const handleStartMatch = async () => {
    if (!roomId) return;
    setStarting(true);
    try {
      await earnclashApi.startMatch(roomId);
      wsRef.current?.send(JSON.stringify({ type: "start_match" }));
    } catch (error) {
      console.error("Failed to start match:", error);
    } finally {
      setStarting(false);
    }
  };

  const handleFinishMatch = async () => {
    if (!roomId) return;
    try {
      await earnclashApi.finishMatch(roomId);
      wsRef.current?.send(JSON.stringify({ type: "finish_match" }));
    } catch (error) {
      console.error("Failed to finish match:", error);
    }
  };

  const handleUpdatePlayer = async (score: number, result: MatchResult) => {
    try {
      await earnclashApi.updatePlayer(roomId, { score, result });
      wsRef.current?.send(JSON.stringify({ type: "player_update", score, result }));
    } catch (error) {
      console.error("Failed to update player:", error);
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

  const getResultIcon = (result: string) => {
    switch (result) {
      case "WIN":
        return <Trophy size={20} className="text-amber-400" />;
      case "LOSS":
        return <XCircle size={20} className="text-rose-400" />;
      case "DRAW":
        return <Users size={20} className="text-slate-400" />;
      default:
        return null;
    }
  };

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const { user } = useAuth();
  const userId = user?.id || "";

  const isHost = room.host_id === userId;
  const currentPlayer = room.players.find((p) => p.user_id === userId);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/earnclash")}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{room.name}</h1>
              <p className="text-[10px] text-slate-400 capitalize">{room.game_mode.replace("_", " ")}</p>
            </div>
          </div>
          <span className={`text-[10px] px-3 py-1 rounded-full ${getStatusColor(room.status)}`}>
            {room.status}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-white">Stake: {room.stake_amount} {room.stake_currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-indigo-400" />
              <span className="text-xs text-slate-400">Host: {room.host_id.slice(0, 8)}...</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-indigo-400" />
              {room.current_players}/{room.max_players} Players
            </span>
            {connected ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={12} />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <XCircle size={12} />
                Disconnected
              </span>
            )}
          </div>
        </div>

        {room.status === "WAITING" && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">Players</h2>
            {room.players.map((player) => (
              <div key={player.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Users size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{player.user_id.slice(0, 8)}...</p>
                    <p className="text-[10px] text-slate-400">
                      {player.is_ready ? "Ready" : "Not Ready"}
                    </p>
                  </div>
                </div>
                {player.is_ready && <CheckCircle2 size={16} className="text-emerald-400" />}
              </div>
            ))}
            {isHost && (
              <button
                onClick={handleStartMatch}
                disabled={starting || room.current_players < 2}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {starting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Match
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {room.status === "IN_PROGRESS" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {room.players.map((player) => (
                <div key={player.id} className="glass-card p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-2">
                    <Users size={24} className="text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{player.user_id.slice(0, 8)}...</p>
                  <p className="text-2xl font-bold text-white">{player.score}</p>
                  <p className="text-[10px] text-slate-400">Score</p>
                </div>
              ))}
            </div>
            {isHost && (
              <button
                onClick={handleFinishMatch}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Finish Match
              </button>
            )}
          </div>
        )}

        {room.status === "FINISHED" && (
          <div className="text-center py-8">
            <Trophy size={64} className="text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Match Finished!</h2>
            <div className="space-y-2 mt-4">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div key={player.id} className="glass-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                      <span className="text-sm font-bold text-white">{player.user_id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{player.score}</span>
                      {getResultIcon(player.result)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
