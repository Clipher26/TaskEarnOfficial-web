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

export interface BadgeType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earning_boost_pct: number;
  criteria_type: string;
  criteria_value?: number;
  is_active: boolean;
  created_at?: string;
}

export interface UserBadge {
  id: string;
  badge_type_id: string;
  badge_code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earning_boost_pct: number;
  earned_at?: string;
  is_equipped: boolean;
}

export const badgesApi = {
  getBadgeTypes: async (): Promise<BadgeType[]> => {
    const res = await API.get("/badges/types");
    return res.data;
  },
  getUserBadges: async (): Promise<{ badges: UserBadge[] }> => {
    const res = await API.get("/badges/user");
    return res.data;
  },
  equipBadge: async (badgeId: string) => {
    const res = await API.post(`/badges/equip/${badgeId}`);
    return res.data;
  },
};
