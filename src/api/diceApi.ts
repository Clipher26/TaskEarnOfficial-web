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

export interface DiceRollRequest {
  bet_amount: number;
}

export interface DiceRollResponse {
  success: boolean;
  dice_value: number;
  payout_multiplier: number;
  tcoin_won: number;
  message: string;
}

export const diceApi = {
  doubleOrNothing: async (betAmount: number = 50): Promise<DiceRollResponse> => {
    const res = await API.post("/gamification/dice-roll", { bet_amount: betAmount });
    return res.data;
  },
};
