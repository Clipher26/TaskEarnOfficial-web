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

export interface ReferralStats {
  total_referrals: number;
  total_earnings_usdt: number;
  tier1_count: number;
  tier2_count: number;
}

export interface ReferralTeamMember {
  user_id: string;
  username: string;
  tier_level: number;
  joined_at: string;
}

export interface ReferralEarning {
  id: string;
  amount_usdt: number;
  tcoin_awarded: number;
  fee_type: string;
  referee_name: string;
  created_at: string;
}

export interface ReferralCommission {
  id: string;
  amount_usdt: number;
  tcoin_awarded: number;
  referee_name: string;
  deposit_amount: number;
  deposit_currency: string;
  created_at: string;
}

export const referralApi = {
  getReferralCode: async (): Promise<{ referral_code: string; referral_link: string }> => {
    const res = await API.get("/referral/code");
    return res.data;
  },

  getReferralStats: async (): Promise<ReferralStats> => {
    const res = await API.get("/referral/stats");
    return res.data;
  },

  getReferralTeam: async (): Promise<{ team: ReferralTeamMember[] }> => {
    const res = await API.get("/referral/team");
    return res.data;
  },

  getReferralEarnings: async (): Promise<{ earnings: ReferralEarning[] }> => {
    const res = await API.get("/referral/earnings");
    return res.data;
  },

  getReferralCommissions: async (): Promise<{ commissions: ReferralCommission[] }> => {
    const res = await API.get("/referral/commissions");
    return res.data;
  },
};
