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

export interface UserMysteryBox {
  id: string;
  box_id: string;
  box_name: string;
  opened: boolean;
  reward_type?: string;
  reward_amount?: number;
  reward_currency?: string;
  rarity?: string;
  claimed: boolean;
  awarded_at?: string;
  opened_at?: string;
}

export const mysteryBoxApi = {
  getUserBoxes: async (): Promise<{ boxes: UserMysteryBox[] }> => {
    const res = await API.get("/mystery-boxes/user");
    return res.data;
  },
  openBox: async (boxId: string) => {
    const res = await API.post(`/mystery-boxes/open/${boxId}`);
    return res.data;
  },
  claimBoxReward: async (boxId: string) => {
    const res = await API.post(`/mystery-boxes/claim/${boxId}`);
    return res.data;
  },
};
