import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type GameMode = "CLASSIC" | "RANKED" | "QUICK_MATCH" | "TOURNAMENT";
export type RoomStatus = "WAITING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED" | "EXPIRED";
export type MatchResult = "PENDING" | "WIN" | "LOSS" | "DRAW" | "DISCONNECTED";

export interface EarnClashPlayer {
  id: string;
  room_id: string;
  user_id: string;
  score: number;
  is_ready: boolean;
  result: MatchResult;
  payout_amount: number;
  payout_credited: boolean;
  payout_tx_id?: string;
  joined_at?: string;
}

export interface EarnClashRoom {
  id: string;
  name: string;
  host_id: string;
  game_mode: GameMode;
  stake_amount: number;
  stake_currency: string;
  max_players: number;
  current_players: number;
  status: RoomStatus;
  room_code?: string;
  metadata?: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnClashRoomDetail extends EarnClashRoom {
  players: EarnClashPlayer[];
}

export interface EarnClashMatchState {
  room_id: string;
  status: RoomStatus;
  players: EarnClashPlayer[];
  started_at?: string;
  finished_at?: string;
}

export const earnclashApi = {
  listRooms: async (gameMode?: GameMode, status?: RoomStatus): Promise<EarnClashRoom[]> => {
    const params = new URLSearchParams();
    if (gameMode) params.append("game_mode", gameMode);
    if (status) params.append("status", status);
    const res = await API.get(`/earnclash/rooms?${params.toString()}`);
    return res.data;
  },

  getRoom: async (roomId: string): Promise<EarnClashRoomDetail> => {
    const res = await API.get(`/earnclash/rooms/${roomId}`);
    return res.data;
  },

  createRoom: async (payload: {
    name: string;
    game_mode?: GameMode;
    stake_amount?: number;
    stake_currency?: string;
    max_players?: number;
    metadata?: string;
  }): Promise<EarnClashRoom> => {
    const res = await API.post("/earnclash/rooms/create", payload);
    return res.data;
  },

  joinRoom: async (roomId: string): Promise<EarnClashRoom> => {
    const res = await API.post("/earnclash/rooms/join", { room_id: roomId });
    return res.data;
  },

  leaveRoom: async (roomId: string): Promise<EarnClashRoom> => {
    const res = await API.post(`/earnclash/rooms/${roomId}/leave`);
    return res.data;
  },

  updatePlayer: async (roomId: string, payload: {
    is_ready?: boolean;
    score?: number;
    result?: MatchResult;
  }): Promise<EarnClashPlayer> => {
    const res = await API.patch(`/earnclash/rooms/${roomId}/players/me`, payload);
    return res.data;
  },

  startMatch: async (roomId: string): Promise<EarnClashRoom> => {
    const res = await API.post(`/earnclash/rooms/${roomId}/start`);
    return res.data;
  },

  finishMatch: async (roomId: string): Promise<EarnClashRoom> => {
    const res = await API.post(`/earnclash/rooms/${roomId}/finish`);
    return res.data;
  },

  getMatchState: async (roomId: string): Promise<EarnClashMatchState> => {
    const res = await API.get(`/earnclash/rooms/${roomId}/state`);
    return res.data;
  },
};
