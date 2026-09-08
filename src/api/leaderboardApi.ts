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

export interface LeaderboardEntry {
  user_id: string;
  score: number;
  handle?: string;
}

export interface LeaderboardResponse {
  category: string;
  entries: LeaderboardEntry[];
}

export const leaderboardApi = {
  getLeaderboard: async (category: string): Promise<LeaderboardResponse> => {
    const res = await API.get(`/leaderboards/${category}`);
    return res.data;
  },
};
