import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/nfts`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(async (config) => {
  let token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) {
    try {
      const { supabase } = await import("@/lib/api");
      const session = await supabase.auth.getSession();
      token = session.data.session?.access_token || null;
    } catch {
      // ignore
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export interface NFTCollection {
  id: string;
  name: string;
  description?: string;
  symbol?: string;
  icon_url?: string;
  contract_address?: string;
  is_active: boolean;
  created_at: string;
}

export interface NFTItem {
  id: string;
  collection_id?: string;
  token_id: string;
  name: string;
  description?: string;
  image_url?: string;
  metadata?: Record<string, any>;
  rarity: string;
  nft_type: string;
  earning_bonus: number;
  is_listed: boolean;
  list_price?: number;
  created_at: string;
}

export interface NFTOwnership {
  id: string;
  user_id: string;
  nft_id: string;
  acquired_at: string;
  is_active: boolean;
  is_staked: boolean;
  staked_at?: string;
  staking_end?: string;
}

export interface NFTListing {
  id: string;
  nft_id: string;
  seller_id: string;
  price: number;
  listing_type: string;
  auction_start_time?: string;
  auction_end_time?: string;
  reserve_price?: number;
  min_bid_increment: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NFTStaking {
  id: string;
  user_id: string;
  nft_id: string;
  staked_at: string;
  staking_duration: number;
  staking_end?: string;
  reward_rate: number;
  rewards_earned: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const nftApi = {
  getUserNFTs: async (skip = 0, limit = 20): Promise<NFTOwnership[]> => {
    const { data } = await API.get(`/?skip=${skip}&limit=${limit}`);
    return data;
  },

  getMarketplace: async (skip = 0, limit = 20, rarity?: string, nft_type?: string): Promise<{ items: any[]; total: number; page: number; limit: number }> => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (rarity) params.append("rarity", rarity);
    if (nft_type) params.append("nft_type", nft_type);
    const { data } = await API.get(`/marketplace?${params.toString()}`);
    return data;
  },

  getNFT: async (nftId: string): Promise<NFTItem> => {
    const { data } = await API.get(`/${nftId}`);
    return data;
  },

  listNFT: async (nftId: string, price: number, listingType = "fixed", auctionEndTime?: string, reservePrice?: number): Promise<NFTListing> => {
    const { data } = await API.post(`/${nftId}/list`, { price, listing_type: listingType, auction_end_time: auctionEndTime, reserve_price: reservePrice });
    return data;
  },

  buyNFT: async (listingId: string, price: number): Promise<{ success: boolean; listing_id: string; price: number }> => {
    const { data } = await API.post(`/${listingId}/buy`, { price });
    return data;
  },

  stakeNFT: async (nftId: string, stakingDuration: number): Promise<NFTStaking> => {
    const { data } = await API.post(`/${nftId}/stake`, { staking_duration: stakingDuration });
    return data;
  },

  unstakeNFT: async (nftId: string): Promise<{ success: boolean; rewards_earned: number }> => {
    const { data } = await API.post(`/${nftId}/unstake`);
    return data;
  },

  transferNFT: async (nftId: string, recipientId: string): Promise<{ success: boolean }> => {
    const { data } = await API.post(`/${nftId}/transfer`, { recipient_id: recipientId });
    return data;
  },

  getStakingDashboard: async (): Promise<{ stakings: NFTStaking[]; total_rewards: number; active_count: number }> => {
    const { data } = await API.get("/staking/dashboard");
    return data;
  },

  getCollections: async (): Promise<NFTCollection[]> => {
    const { data } = await API.get("/collections");
    return data;
  },
};
