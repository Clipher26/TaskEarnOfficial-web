import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/p2p`,
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

export interface P2POrder {
  id: string;
  seller_id: string;
  buyer_id?: string;
  amount_crypto: number;
  amount_fiat: number;
  fiat_currency: string;
  status: string;
  payment_method_used?: string;
  created_at: string;
  updated_at: string;
}

export interface P2PDispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: string;
  evidence_urls?: string[];
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const p2pApi = {
  getOrders: async (): Promise<P2POrder[]> => {
    const res = await API.get("/orders");
    return res.data;
  },

  createOrder: async (payload: {
    seller_id: string;
    amount_crypto: number;
    amount_fiat: number;
    fiat_currency: string;
    payment_method_used?: string;
  }): Promise<P2POrder> => {
    const res = await API.post("/orders", payload);
    return res.data;
  },

  acceptOrder: async (orderId: string, buyerId: string): Promise<P2POrder> => {
    const res = await API.post(`/orders/${orderId}/accept`, { buyer_id: buyerId });
    return res.data;
  },

  markPaymentSent: async (orderId: string, buyerId: string): Promise<P2POrder> => {
    const res = await API.post(`/orders/${orderId}/payment-sent`, { buyer_id: buyerId });
    return res.data;
  },

  releaseEscrow: async (orderId: string, sellerId: string): Promise<P2POrder> => {
    const res = await API.post(`/orders/${orderId}/release`, { seller_id: sellerId });
    return res.data;
  },

  raiseDispute: async (orderId: string, raisedBy: string, reason: string, evidenceUrls?: string[]) => {
    const res = await API.post(`/orders/${orderId}/dispute`, {
      order_id: orderId,
      raised_by: raisedBy,
      reason,
      evidence_urls: evidenceUrls,
    });
    return res.data;
  },
};
