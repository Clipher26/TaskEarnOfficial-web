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

export interface UserAchievement {
  id: string;
  achievement_id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  achievement_type: string;
  skill_tree?: string;
  progress_count: number;
  completed: boolean;
  claimed: boolean;
  awarded_at?: string;
  created_at: string;
}

export interface SkillTree {
  user_id: string;
  survey_master_points: number;
  fast_cash_points: number;
  earnpoly_ace_points: number;
  trading_whale_points: number;
  total_points_spent: number;
  available_points: number;
  lifetime_earned: number;
}

export const achievementsApi = {
  listAchievements: async (): Promise<{ achievements: UserAchievement[] }> => {
    const res = await API.get("/achievements/");
    return res.data;
  },
  getSkillTree: async (): Promise<SkillTree> => {
    const res = await API.get("/achievements/skill-tree");
    return res.data;
  },
  spendSkillPoint: async (path: string) => {
    const res = await API.post("/achievements/skill-tree/spend", null, { params: { path } });
    return res.data;
  },
  claimAchievementReward: async (achievementId: string) => {
    const res = await API.post(`/achievements/claim/${achievementId}`);
    return res.data;
  },
};
