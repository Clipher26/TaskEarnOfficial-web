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

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  earned_multiplier: number;
  can_check_in: boolean;
  next_check_in: string | null;
}

export interface StreakLoginResponse {
  current_streak: number;
  multiplier: number;
}

export const streakApi = {
  getMyStreak: async (userId: string): Promise<StreakData> => {
    const res = await API.get(`/leaderboards/streak/me?user_id=${userId}`);
    return res.data;
  },

  recordLogin: async (userId: string): Promise<StreakLoginResponse> => {
    const res = await API.post("/leaderboards/streak/login", null, {
      params: { user_id: userId },
    });
    return res.data;
  },
};
