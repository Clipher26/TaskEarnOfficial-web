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

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

export interface Player {
  id: string;
  username: string;
  position: number;
  balance_earn: number;
  balance_cred: number;
  is_in_jail: boolean;
  jail_turns: number;
  owned_properties: string[];
  avatar_color: string;
}

export interface BoardState {
  spaces: Record<string, { owner_id?: string; validators_count: number; is_mortgaged: boolean }>;
  market_condition: "BULL_MARKET" | "BEAR_MARKET" | "SIDEWAYS";
  current_player_index: number;
  dice?: [number, number];
  message?: string;
}

export interface GameSession {
  session_id: string;
  status: string;
  stake_tier: number;
  turn_count: number;
  market_condition: string;
  players: Player[];
  board_state: BoardState;
  created_at?: string;
  awaiting_character_selection?: boolean;
}

export interface RollDiceResponse {
  dice_roll: number;
  new_position: number;
  space_name: string;
  space_type: string;
  space_id: number;
  fine_amount?: number;
  reward_amount?: number;
  reward?: number;
  message: string;
  board_state: BoardState;
  players: Player[];
  turn_count: number;
}

export const earnpolyApi = {
  createSession: async (stakeTier: number = 50): Promise<GameSession> => {
    const res = await API.post("/earnpoly/session", { stake_tier: stakeTier });
    return res.data;
  },

  getSession: async (sessionId: string): Promise<GameSession> => {
    const res = await API.get(`/earnpoly/session/${sessionId}`);
    return res.data;
  },

  rollDice: async (sessionId: string): Promise<RollDiceResponse> => {
    const res = await API.post("/earnpoly/roll", { session_id: sessionId });
    return res.data;
  },

  buyProperty: async (sessionId: string, spaceId: number): Promise<RollDiceResponse> => {
    const res = await API.post("/earnpoly/buy", { session_id: sessionId, space_id: spaceId });
    return res.data;
  },

  stakeNode: async (sessionId: string, spaceId: number): Promise<RollDiceResponse> => {
    const res = await API.post("/earnpoly/stake", { session_id: sessionId, space_id: spaceId });
    return res.data;
  },

  completeTask: async (sessionId: string, spaceId: number): Promise<RollDiceResponse> => {
    const res = await API.post("/earnpoly/task", { session_id: sessionId, space_id: spaceId });
    return res.data;
  },

  endTurn: async (sessionId: string): Promise<{ message: string; next_player_index: number; board_state: BoardState; players: Player[] }> => {
    const res = await API.post("/earnpoly/end-turn", { session_id: sessionId });
    return res.data;
  },

  selectCharacter: async (sessionId: string, characterId: number): Promise<{ message: string; board_state: BoardState; players: Player[] }> => {
    const res = await API.post("/earnpoly/select-character", { session_id: sessionId, character_id: characterId });
    return res.data;
  },
};
