import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 15000,
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

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry_price: number;
  tp1?: number;
  tp2?: number;
  stop_loss?: number;
  indicator_reason?: string;
  status: "ACTIVE" | "HIT_TP1" | "HIT_TP2" | "HIT_SL" | "CANCELLED";
  created_at: string;
}

export const signalApi = {
  getSignals: async (limit: number = 20): Promise<TradingSignal[]> => {
    const res = await API.get(`/api/v1/signals?limit=${limit}`);
    return res.data;
  },

  getMySignals: async (userId: string, limit: number = 20): Promise<TradingSignal[]> => {
    const res = await API.get(`/api/v1/signals/me?user_id=${userId}&limit=${limit}`);
    return res.data;
  },
};
