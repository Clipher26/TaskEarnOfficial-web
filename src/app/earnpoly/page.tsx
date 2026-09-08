"use client";

import React, { useState, useEffect, useCallback } from "react";
import { EarnpolyBoard } from "@/components/EarnpolyBoard";
import { GameSession, Player, BoardState, BOARD_SPACES } from "@/lib/earnpoly";
import { getTelegramUser, triggerHaptic } from "@/lib/telegram";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Dice1, Users, Trophy, Settings2, Shield } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { earnpolyApi, RollDiceResponse } from "@/api/earnpolyApi";
import { CHARACTERS } from "@/lib/earnpoly";

export default function EarnpolyPage() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stakeTier, setStakeTier] = useState<number>(50);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [isSelectingCharacter, setIsSelectingCharacter] = useState(false);

  const tgUser = getTelegramUser();
  const { setActiveModule } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("earnpoly");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (tgUser?.id) {
      setUserId("usr_" + tgUser.id);
    }
  }, [tgUser?.id]);

  const hasValidToken = !!token || isAuthenticated;

  const startGame = useCallback(async () => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return;
    }
    triggerHaptic("heavy");
    setLoading(true);
    setError(null);
    try {
      const result = await earnpolyApi.createSession(stakeTier);
      setSession({
        session_id: result.session_id,
        status: result.status as GameSession["status"],
        stake_tier: result.stake_tier,
        turn_count: result.turn_count,
        market_condition: result.market_condition,
        players: result.players,
        board_state: result.board_state,
        created_at: result.created_at || undefined,
      });
      if (result.awaiting_character_selection) {
        setIsSelectingCharacter(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to start game");
    } finally {
      setLoading(false);
    }
  }, [userId, stakeTier, hasValidToken]);

  const handleRollDice = useCallback(async (): Promise<number> => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return 0;
    }
    if (!session) throw new Error("No active session");
    const result: RollDiceResponse = await earnpolyApi.rollDice(session.session_id);
    const currentPlayer = result.players.find((p) => p.id === userId);
    const currentIdx = result.players.findIndex((p) => p.id === userId);
    setSession((prev) => {
      if (!prev) return prev;
      const updatedPlayers = result.players.map((p) =>
        p.id === userId
          ? { ...p, position: result.players[currentIdx].position, balance_earn: result.players[currentIdx].balance_earn }
          : p
      );
      return {
        ...prev,
        turn_count: result.turn_count,
        players: updatedPlayers,
        board_state: result.board_state,
      };
    });
    return result.dice_roll;
  }, [session, userId]);

  const handleBuyProperty = useCallback(async (spaceId: number) => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return;
    }
    if (!session) return;
    triggerHaptic("medium");
    const result = await earnpolyApi.buyProperty(session.session_id, spaceId);
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: result.players,
        board_state: result.board_state,
      };
    });
  }, [session]);

  const handleStakeNode = useCallback(async (spaceId: number) => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return;
    }
    if (!session) return;
    triggerHaptic("medium");
    const result = await earnpolyApi.stakeNode(session.session_id, spaceId);
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: result.players,
        board_state: result.board_state,
      };
    });
  }, [session]);

  const handleCompleteTask = useCallback(async (spaceId: number) => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return;
    }
    if (!session) return;
    triggerHaptic("medium");
    const result = await earnpolyApi.completeTask(session.session_id, spaceId);
    setSession((prev) => {
      if (!prev) return prev;
      const updatedPlayers = result.players.map((p) =>
        p.id === userId ? { ...p, balance_cred: p.balance_cred + (result.reward || 0) } : p
      );
      return {
        ...prev,
        players: updatedPlayers,
        board_state: result.board_state,
      };
    });
  }, [session, userId]);

  const handleEndTurn = useCallback(async () => {
    if (!hasValidToken) {
      setError("Please log in to play Earnpoly");
      return;
    }
    if (!session) return;
    triggerHaptic("light");
    const result = await earnpolyApi.endTurn(session.session_id);
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        turn_count: prev.turn_count + 1,
        players: result.players,
        board_state: result.board_state,
      };
    });
  }, [session]);

  const handleSelectCharacter = useCallback(async (characterId: number) => {
    if (!session) return;
    triggerHaptic("medium");
    try {
      const result = await earnpolyApi.selectCharacter(session.session_id, characterId);
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: result.players,
          board_state: result.board_state,
        };
      });
      setSelectedCharacterId(characterId);
      setIsSelectingCharacter(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to select character");
    }
  }, [session]);

  if (!session) {
    if (!hasValidToken) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
            <p className="text-sm text-slate-400 mb-6">
              Please log in to play Earnpoly. Your session token is missing or expired.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Dice1 size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Earnpoly</h1>
            <p className="text-sm text-slate-400">
              Crypto board game. Buy protocols, stake nodes, complete tasks.
            </p>
          </div>

          <div className="glass-card p-5 mb-4">
            <label className="text-xs text-slate-400 block mb-2">Stake Tier (Entry Fee)</label>
            <div className="flex gap-2 mb-4">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setStakeTier(tier)}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-bold transition-all
                    ${stakeTier === tier
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }
                  `}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Creating Game..." : "Start Game"}
            </button>
            {error && <p className="text-[10px] text-rose-400 mt-2 text-center">{error}</p>}
            <p className="text-[10px] text-slate-500 mt-3 text-center">
              Backend-powered multiplayer
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>3 Players</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={14} />
              <span>40 Spaces</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3 px-4 pt-4">
          <div>
            <h1 className="text-lg font-bold text-white">Earnpoly</h1>
            <p className="text-[10px] text-slate-400">Stake Tier: ${stakeTier}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Turn {session.turn_count + 1}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mx-4 mb-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <label className="text-xs text-slate-400 block mb-2">Stake Tier</label>
            <div className="flex gap-2">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setStakeTier(tier)}
                  className={`
                    flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all
                    ${stakeTier === tier
                      ? "bg-emerald-500 text-black"
                      : "bg-slate-800 text-slate-400"
                    }
                  `}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3 overflow-x-auto px-4 pb-1">
          {session.players.map((p, idx) => {
            const currentIdx = session.board_state.current_player_index;
            return (
              <div
                key={p.id}
                className={`
                  flex-shrink-0 px-3 py-2 rounded-xl border text-xs min-w-[120px]
                  ${currentIdx === idx
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                  }
                `}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.avatar_color }}
                  />
                  <span className="font-medium truncate">{p.username}</span>
                  {p.id === userId && <span className="text-[8px] text-slate-500">(you)</span>}
                </div>
                <div className="mt-1 flex gap-2 text-[10px]">
                  <span className="text-amber-400 font-mono">${p.balance_earn}</span>
                  <span className="text-blue-400 font-mono">{p.balance_cred} CR</span>
                </div>
              </div>
            );
          })}
        </div>

        {isSelectingCharacter && session && (
          <div className="mx-4 mb-4 p-4 bg-slate-900 border border-emerald-500/30 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-2">Select Your Character</h3>
            <p className="text-[10px] text-slate-400 mb-3">Choose one character. This cannot be changed later.</p>
            <div className="grid grid-cols-5 gap-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char.id)}
                  className={`
                    p-2 rounded-xl border-2 transition-all active:scale-95
                    ${selectedCharacterId === char.id
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{char.emoji}</div>
                  <div className="text-[8px] text-slate-400 truncate">{char.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <EarnpolyBoard
          session={session}
          currentPlayerId={userId}
          onRollDice={handleRollDice}
          onBuyProperty={handleBuyProperty}
          onStakeNode={handleStakeNode}
          onCompleteTask={handleCompleteTask}
          onEndTurn={handleEndTurn}
          playerCharacterId={selectedCharacterId}
        />

        {session.board_state.message && (
          <div className="mx-4 mt-3 text-center">
            <p className="text-xs text-emerald-400 animate-pulse">
              {session.board_state.message}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
