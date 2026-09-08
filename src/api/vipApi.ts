import axios from "axios";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${FASTAPI_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface VipTierInfo {
  tier: string;
  price_usdt: number;
  task_multiplier: number;
  trading_fee_rate: number;
  benefits: string[];
  max_trades_per_day: number;
  max_trade_size: number;
  signals_per_day: number;
  signal_delay: string;
  copy_trading_traders: number;
  markets_access: string;
  withdrawal_min: number;
  withdrawal_fee: number;
  processing_time: string;
}

export interface VipTiersResponse {
  current_tier: string;
  available_upgrades: VipTierInfo[];
}

export interface VipUpgradeRequest {
  target_tier: string;
  payment_method: "WALLET_BALANCE" | "EXTERNAL_CRYPTO" | "BANK_TRANSFER";
}

export interface VipUpgradeResponse {
  success: boolean;
  new_vip_tier: string;
  vip_level: number;
  task_multiplier: number;
  trading_fee_rate: number;
  message: string;
}

export const vipApi = {
  getTiers: async (user_id: string): Promise<VipTiersResponse> => {
    const res = await API.get(`/vip/tiers?user_id=${user_id}`);
    return res.data;
  },

  upgradeTier: async (payload: VipUpgradeRequest, user_id: string): Promise<VipUpgradeResponse> => {
    const res = await API.post(`/vip/upgrade?user_id=${user_id}`, payload);
    return res.data;
  },
};
