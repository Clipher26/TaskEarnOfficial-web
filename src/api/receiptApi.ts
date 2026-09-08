import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
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

export interface ReceiptImageResponse {
  id: string;
  user_id: string;
  image_url: string;
  amount?: number | null;
  currency?: string | null;
  status: string;
  confidence_score?: number | null;
  detected_anomalies?: any[] | null;
  extracted_metadata?: Record<string, any> | null;
  forensic_reasoning?: string | null;
  error_log?: string | null;
  admin_verdict?: string | null;
  admin_note?: string | null;
  balance_credited?: boolean;
  credited_amount?: number | null;
  credited_at?: string | null;
  auto_processed?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReceiptUploadResponse {
  success: boolean;
  receipt: ReceiptImageResponse;
  message?: string;
}

export const receiptApi = {
  uploadReceipt: async (file: File): Promise<ReceiptUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await API.post("/api/v1/receipts/upload", formData);
    return res.data;
  },

  getReceipt: async (receiptId: string): Promise<ReceiptImageResponse> => {
    const res = await API.get(`/api/v1/receipts/${receiptId}`);
    return res.data;
  },
};
