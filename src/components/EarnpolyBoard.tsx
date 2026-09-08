"use client";

import React, { useState, useEffect } from "react";
import { BOARD_SPACES, TIER_COLORS, getSpaceById } from "@/lib/earnpoly";
import { GameSession, Player } from "@/lib/earnpoly";
import { triggerHaptic } from "@/lib/telegram";

interface SpaceCardProps {
  space: typeof BOARD_SPACES[0];
  isCorner: boolean;
  owner?: string;
  validators: number;
  players: Player[];
  isCurrentPlayerSpace: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
  space,
  isCorner,
  owner,
  validators,
  players,
  isCurrentPlayerSpace,
  onClick,
  compact = false,
}) => {
  const tier = TIER_COLORS[space.type];

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-between p-0.5
        border border-slate-700/60 cursor-pointer transition-all w-full h-full
        ${isCorner ? "bg-slate-800/90" : "bg-slate-900/80"}
        ${isCurrentPlayerSpace ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 z-10" : ""}
        hover:brightness-110 active:scale-95
      `}
    >
      {space.color && (
        <div className="w-full h-1.5" style={{ backgroundColor: space.color }} />
      )}
      
      <div className="flex flex-col items-center text-center w-full px-0.5">
        <span className="text-[10px] leading-none mb-0.5">{space.icon}</span>
        {!compact && (
          <span className="text-[7px] font-medium text-slate-300 leading-tight line-clamp-2">
            {space.name}
          </span>
        )}
        {space.price && !compact && (
          <span className="text-[7px] text-slate-500 font-mono">${space.price}</span>
        )}
      </div>

      {validators > 0 && !compact && (
        <div className="absolute top-0.5 right-0.5">
          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-0.5 rounded">
            ⚡{validators}
          </span>
        </div>
      )}

      {owner && !compact && (
        <div className="absolute bottom-0.5 left-0.5">
          <div
            className="w-1.5 h-1.5 rounded-full border border-slate-900"
            style={{ backgroundColor: getPlayerColor(owner) }}
          />
        </div>
      )}

      {players.length > 0 && false && (
        <div className="absolute bottom-1 flex -space-x-1">
          {players.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              className="w-2 h-2 rounded-full border border-slate-900"
              style={{
                backgroundColor: p.avatar_color,
                zIndex: players.length - i,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function getPlayerColor(playerId: string): string {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"];
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const CHARACTER_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef",
  "#f43f5e", "#14b8a6", "#facc15", "#fb923c", "#a855f7",
  "#22c55e", "#eab308", "#ec4899", "#0ea5e9", "#64748b",
];

interface Character3DProps {
  characterId: number | null | undefined;
  size?: number;
}

const Character3D: React.FC<Character3DProps> = ({ characterId, size = 28 }) => {
  const color = characterId !== null && characterId !== undefined
    ? CHARACTER_COLORS[characterId % CHARACTER_COLORS.length]
    : "#64748b";

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        perspective: 200,
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(-20deg) rotateY(-30deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-lg border-2 border-white/30"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}80, inset 0 0 10px rgba(255,255,255,0.2)`,
            transform: "translateZ(8px)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs drop-shadow-md">
            {characterId !== null && characterId !== undefined ? characterId + 1 : "?"}
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-lg border-2 border-white/20"
          style={{
            backgroundColor: color,
            opacity: 0.7,
            transform: "rotateY(90deg) translateZ(14px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-lg border-2 border-white/20"
          style={{
            backgroundColor: color,
            opacity: 0.7,
            transform: "rotateY(-90deg) translateZ(14px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-lg border-2 border-white/20"
          style={{
            backgroundColor: color,
            opacity: 0.7,
            transform: "rotateX(90deg) translateZ(14px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-lg border-2 border-white/20"
          style={{
            backgroundColor: color,
            opacity: 0.7,
            transform: "rotateX(-90deg) translateZ(14px)",
          }}
        />
      </div>
    </div>
  );
};

function calculateRent(space: any, validatorCount: number): number {
  if (!space.price) return 0;
  return Math.floor(space.price * 0.1 * (1 + validatorCount * 0.05));
}

interface DiceProps {
  rolling: boolean;
  value?: number;
}

const Dice: React.FC<DiceProps> = ({ rolling, value }) => {
  const [display, setDisplay] = useState<number>(1);

  useEffect(() => {
    if (!rolling) {
      if (value !== undefined) setDisplay(value);
      return;
    }
    const interval = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 6) + 1);
    }, 80);
    return () => clearInterval(interval);
  }, [rolling, value]);

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          w-14 h-14 rounded-xl bg-slate-800 border-2 border-slate-600
          flex items-center justify-center text-2xl font-bold text-white
          shadow-lg transition-all
          ${rolling ? "animate-bounce" : ""}
        `}
        style={{
          transform: rolling ? `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)` : undefined,
          transition: rolling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {display}
      </div>
    </div>
  );
};

interface EarnpolyBoardProps {
  session: GameSession;
  currentPlayerId: string;
  onRollDice: () => Promise<number>;
  onBuyProperty: (spaceId: number) => Promise<void>;
  onStakeNode: (spaceId: number) => Promise<void>;
  onCompleteTask: (spaceId: number) => Promise<void>;
  onEndTurn: () => Promise<void>;
  compact?: boolean;
  playerCharacterId?: number | null;
}

export const EarnpolyBoard: React.FC<EarnpolyBoardProps> = ({
  session,
  currentPlayerId,
  onRollDice,
  onBuyProperty,
  onStakeNode,
  onCompleteTask,
  onEndTurn,
  compact = false,
  playerCharacterId,
}) => {
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<number | undefined>();
  const [phase, setPhase] = useState<"ROLL" | "ACTION" | "END">("ROLL");
  const [moving, setMoving] = useState(false);

  const currentPlayer = session.players.find((p) => p.id === currentPlayerId);
  const currentPlayerIndex = session.players.findIndex((p) => p.id === currentPlayerId);
  const isMyTurn = session.status === "IN_PROGRESS" && session.board_state.current_player_index === currentPlayerIndex;
  const awaitingCharacter = session.board_state.awaiting_character_selection;

  const currentSpace = currentPlayer ? getSpaceById(currentPlayer.position) : null;

  const handleRoll = async () => {
    if (!isMyTurn || rolling || phase !== "ROLL") return;
    triggerHaptic("heavy");
    setRolling(true);
    setDice(undefined);
    setMoving(false);

    try {
      const result = await onRollDice();
      setDice(result);
      setRolling(false);
      setMoving(true);
      setTimeout(() => setMoving(false), 800);
      setPhase("ACTION");
      triggerHaptic("medium");
    } catch {
      setRolling(false);
    }
  };

  const handleBuy = async () => {
    if (!currentPlayer || !currentSpace) return;
    triggerHaptic("medium");
    await onBuyProperty(currentPlayer.position);
    setPhase("END");
  };

  const handleStake = async () => {
    if (!currentPlayer || !currentSpace) return;
    triggerHaptic("medium");
    await onStakeNode(currentPlayer.position);
    setPhase("END");
  };

  const handleTask = async () => {
    if (!currentPlayer || !currentSpace) return;
    triggerHaptic("medium");
    await onCompleteTask(currentPlayer.position);
    setPhase("END");
  };

  const handleEndTurn = async () => {
    triggerHaptic("light");
    await onEndTurn();
    setPhase("ROLL");
    setDice(undefined);
  };

  const renderCenter = () => {
    if (!compact) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Earnpoly</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {session.board_state.market_condition.replace("_", " ")}
            </p>
          </div>

          {session.board_state.message && (
            <p className="text-xs text-emerald-400 text-center animate-pulse">
              {session.board_state.message}
            </p>
          )}

          <Dice rolling={rolling} value={dice} />

          {dice && !rolling && phase === "ROLL" && (
            <div className="text-center">
              <p className="text-xs text-slate-400">Rolled {dice}</p>
            </div>
          )}

          {isMyTurn && !awaitingCharacter && phase === "ROLL" && (
            <button
              onClick={handleRoll}
              disabled={rolling}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {rolling ? "Rolling..." : "🎲 Roll Dice"}
            </button>
          )}

          {isMyTurn && awaitingCharacter && (
            <div className="text-center text-xs text-amber-400 animate-pulse">
              Select your character to continue
            </div>
          )}

          {isMyTurn && phase === "ACTION" && currentSpace && (
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              {currentSpace.type === "PROPERTY" && !session.board_state.spaces[currentSpace.name]?.owner_id && (
                <button
                  onClick={handleBuy}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg active:scale-95 transition-all"
                >
                  Buy ${currentSpace.price}
                </button>
              )}
              {currentSpace.type === "PROPERTY" && session.board_state.spaces[currentSpace.name]?.owner_id && session.board_state.spaces[currentSpace.name].owner_id !== currentPlayerId && (
                <div className="text-center text-xs text-amber-400">
                  Pay Rent: ${calculateRent(currentSpace, session.board_state.spaces[currentSpace.name].validators_count)}
                </div>
              )}
              {currentSpace.type === "PROPERTY" && session.board_state.spaces[currentSpace.name]?.owner_id === currentPlayerId && (
                <button
                  onClick={handleStake}
                  className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg active:scale-95 transition-all"
                >
                  Stake Node
                </button>
              )}
              {currentSpace.type === "TASK" && (
                <button
                  onClick={handleTask}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-lg active:scale-95 transition-all"
                >
                  Complete Task
                </button>
              )}
              {currentSpace.type === "CORNER" && currentPlayer && currentSpace.name === "Crypto Jail / Rugged" && currentPlayer.is_in_jail && (
                <div className="text-center text-xs text-red-400">In Jail (turn {currentPlayer.jail_turns})</div>
              )}
            </div>
          )}

          {isMyTurn && phase === "END" && (
            <button
              onClick={handleEndTurn}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white font-bold text-sm rounded-xl"
            >
              End Turn
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-2 p-3">
        <h2 className="text-sm font-bold text-white">Earnpoly</h2>
        <div className="flex gap-2">
          <Dice rolling={rolling} value={dice} />
        </div>
        {isMyTurn && !awaitingCharacter && phase === "ROLL" && (
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="px-4 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-lg active:scale-95"
          >
            Roll
          </button>
        )}
        {isMyTurn && awaitingCharacter && (
          <div className="text-center text-[10px] text-amber-400">Select character</div>
        )}
        {isMyTurn && phase === "ACTION" && currentSpace && currentSpace.type === "PROPERTY" && !session.board_state.spaces[currentSpace.name]?.owner_id && (
          <button onClick={handleBuy} className="px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg active:scale-95">
            Buy ${currentSpace.price}
          </button>
        )}
      </div>
    );
  };

  const gridCells: React.ReactNode[] = [];
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 11; col++) {
      const isCenter = row >= 4 && row <= 6 && col >= 4 && col <= 6;

      if (isCenter) {
        if (row === 5 && col === 5) {
          gridCells.push(
            <div key={`center-${row}-${col}`} className="col-span-1 row-span-1">
              {renderCenter()}
            </div>
          );
        } else {
          gridCells.push(
            <div key={`inner-${row}-${col}`} className="col-span-1 row-span-1 bg-slate-900/50" />
          );
        }
        continue;
      }

      let spaceId: number | null = null;
      let isCorner = false;

      if (row === 10 && col <= 10) {
        spaceId = col;
        isCorner = col === 0 || col === 10;
      } else if (col === 10 && row < 10) {
        spaceId = 20 - row;
        isCorner = row === 0;
      } else if (row === 0 && col < 10) {
        spaceId = 30 - col;
        isCorner = col === 0;
      } else if (col === 0 && row > 0) {
        spaceId = 40 - row;
      }

      if (spaceId === null) {
        gridCells.push(<div key={`empty-${row}-${col}`} className="col-span-1 row-span-1" />);
        continue;
      }

      const space = getSpaceById(spaceId);
      if (!space) {
        gridCells.push(<div key={`empty-${row}-${col}`} className="col-span-1 row-span-1" />);
        continue;
      }

      const spaceState = session.board_state.spaces[space.name];
      const owner = spaceState?.owner_id;
      const validators = spaceState?.validators_count || 0;
      const playersOnSpace = session.players.filter((p) => p.position === spaceId);
      const isCurrentPlayerSpace = currentPlayer?.position === spaceId;

      gridCells.push(
        <div key={space.id} className="col-span-1 row-span-1 flex items-center justify-center">
          <SpaceCard
            space={space}
            isCorner={isCorner}
            owner={owner}
            validators={validators}
            players={playersOnSpace}
            isCurrentPlayerSpace={isCurrentPlayerSpace}
            onClick={() => isMyTurn && phase === "ACTION" && space.type === "PROPERTY" && !owner && handleBuy()}
            compact={compact}
          />
        </div>
      );
    }
  }

  const getGridPosition = (position: number): { row: number; col: number } | null => {
    if (position < 0 || position > 39) return null;
    if (position <= 10) return { row: 10, col: position };
    if (position <= 19) return { row: 20 - position, col: 10 };
    if (position <= 30) return { row: 0, col: 30 - position };
    return { row: 40 - position, col: 0 };
  };

  const renderCharacters = () => {
    if (compact) return null;
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        {session.players.map((player) => {
          const pos = getGridPosition(player.position);
          if (!pos) return null;
          const cellWidth = 100 / 11;
          const cellHeight = 100 / 11;
          const left = pos.col * cellWidth + cellWidth / 2;
          const top = pos.row * cellHeight + cellHeight / 2;
          const isCurrent = player.id === currentPlayerId;

          return (
            <div
              key={player.id}
              className="absolute transition-all duration-700 ease-out"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%) ${moving && isCurrent ? "scale(1.2)" : "scale(1)"}`,
                zIndex: isCurrent ? 30 : 20,
              }}
            >
              <Character3D characterId={player.character_id ?? null} size={isCurrent ? 32 : 24} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="grid gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-2xl relative"
        style={{
          gridTemplateColumns: `repeat(11, 1fr)`,
          gridTemplateRows: `repeat(11, 1fr)`,
          aspectRatio: "1 / 1",
        }}
      >
        {gridCells}
        {renderCharacters()}
      </div>
    </div>
  );
};
