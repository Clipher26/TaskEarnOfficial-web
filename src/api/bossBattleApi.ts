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

export interface BossBattle {
  id: string;
  name: string;
  description: string;
  target_tasks: number;
  total_tasks_completed: number;
  reward_multiplier: number;
  status: "UPCOMING" | "ACTIVE" | "VICTORY" | "DEFEAT";
  starts_at?: string;
  ends_at?: string;
  progress_pct: number;
}

export interface BossBattleProgress {
  id: string;
  boss_battle_id: string;
  user_id: string;
  tasks_contributed: number;
  updated_at?: string;
}

export interface ContributeTaskResponse {
  success: boolean;
  battle: BossBattle;
  tasks_contributed: number;
}

export const bossBattleApi = {
  listBattles: async (): Promise<{ battles: BossBattle[] }> => {
    const res = await API.get("/boss-battle/");
    return res.data;
  },
  getActiveBattle: async (): Promise<BossBattle | null> => {
    const res = await API.get("/boss-battle/active");
    return res.data;
  },
  getUserProgress: async (): Promise<BossBattleProgress[]> => {
    const res = await API.get("/boss-battle/progress");
    return res.data;
  },
  contributeTask: async (): Promise<ContributeTaskResponse> => {
    const res = await API.post("/boss-battle/contribute");
    return res.data;
  },
};
