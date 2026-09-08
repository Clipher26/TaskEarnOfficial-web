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

export type MarketStatus = "ACTIVE" | "RESOLVED" | "CANCELLED";
export type OutcomeType = "YES" | "NO";

export interface PredictionMarket {
  id: string;
  title: string;
  description?: string;
  resolution_criteria?: string;
  status: MarketStatus;
  yes_liquidity: number;
  no_liquidity: number;
  total_volume: number;
  resolution_outcome?: OutcomeType;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionPosition {
  id: string;
  market_id: string;
  user_id: string;
  outcome: OutcomeType;
  shares: number;
  avg_price: number;
  realized_pnl: number;
  created_at?: string;
  updated_at?: string;
}

export interface AMMSwapRequest {
  market_id: string;
  outcome: OutcomeType;
  amount: number;
  max_price?: number;
}

export interface AMMSwapResponse {
  shares: number;
  price: number;
  new_yes_liquidity: number;
  new_no_liquidity: number;
  tx_id: string;
}

export const predictionApi = {
  listMarkets: async (): Promise<PredictionMarket[]> => {
    const res = await API.get("/prediction/markets");
    return res.data;
  },

  getMarket: async (marketId: string): Promise<PredictionMarket> => {
    const res = await API.get(`/prediction/markets/${marketId}`);
    return res.data;
  },

  createMarket: async (payload: {
    title: string;
    description?: string;
    resolution_criteria?: string;
  }): Promise<PredictionMarket> => {
    const res = await API.post("/prediction/markets", payload);
    return res.data;
  },

  swap: async (payload: AMMSwapRequest): Promise<AMMSwapResponse> => {
    const res = await API.post("/prediction/swap", payload);
    return res.data;
  },

  getMyPositions: async (): Promise<PredictionPosition[]> => {
    const res = await API.get("/prediction/positions/me");
    return res.data;
  },
};
