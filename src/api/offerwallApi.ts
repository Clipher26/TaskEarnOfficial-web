import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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

export interface OfferwallOffer {
  id: string;
  title: string;
  description?: string;
  category: string;
  payout_usd: number;
  tcoin_reward: number;
  country: string;
  action_url: string;
  advertiser_name: string;
  campaign_id: string;
  is_featured: boolean;
  conversions: number;
  budget_usd: number;
  spent_usd: number;
}

export interface OfferwallConversion {
  id: string;
  offer_title: string;
  payout_usd: number;
  tcoin_awarded: number;
  status: string;
  created_at: string;
}

export interface OfferwallStats {
  total_offers: number;
  total_completed: number;
  total_earned_usdt: number;
  total_earned_tcoin: number;
}

export const offerwallApi = {
  getOffers: async (country: string = "ALL", category?: string): Promise<{ offers: OfferwallOffer[]; provider: string }> => {
    const res = await API.get(`/offerwall/official/offers?country=${country}${category ? `&category=${category}` : ""}`);
    return res.data;
  },

  getFeaturedOffers: async (limit: number = 5): Promise<{ offers: OfferwallOffer[]; provider: string }> => {
    const res = await API.get(`/offerwall/official/offers/featured?limit=${limit}`);
    return res.data;
  },

  completeOffer: async (offerId: string): Promise<{ success: boolean; conversion: OfferwallConversion }> => {
    const res = await API.post("/offerwall/official/complete", { offer_id: offerId });
    return res.data;
  },

  getConversions: async (limit: number = 50): Promise<{ conversions: OfferwallConversion[]; provider: string }> => {
    const res = await API.get(`/offerwall/official/conversions?limit=${limit}`);
    return res.data;
  },
};
