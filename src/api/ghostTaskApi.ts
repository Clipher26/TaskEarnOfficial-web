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

export type ZkProofType = "TLS_NOTARY" | "RECLAIM" | "CUSTOM";
export type GhostTaskStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface GhostTask {
  id: string;
  title: string;
  description: string;
  target_url: string;
  required_proof_type: ZkProofType;
  required_claim: string;
  reward_amount: number;
  reward_currency: string;
  max_participants?: number;
  total_completions: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface GhostTaskProof {
  id: string;
  task_id: string;
  user_id: string;
  proof_identifier: string;
  proof_type: ZkProofType;
  claim_data?: string;
  signature: string;
  public_signals?: string;
  status: GhostTaskStatus;
  reward_credited: boolean;
  reward_tx_id?: string;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const ghostTaskApi = {
  listTasks: async (): Promise<GhostTask[]> => {
    const res = await API.get("/ghost-tasks/tasks");
    return res.data;
  },

  createTask: async (payload: {
    title: string;
    description: string;
    target_url: string;
    required_proof_type: ZkProofType;
    required_claim: string;
    reward_amount: number;
    reward_currency?: string;
    max_participants?: number;
  }): Promise<GhostTask> => {
    const res = await API.post("/ghost-tasks/tasks", payload);
    return res.data;
  },

  verifyProof: async (payload: {
    task_id: string;
    proof_identifier: string;
    proof_type: ZkProofType;
    claim_data?: string;
    signature: string;
    public_signals?: string;
  }): Promise<GhostTaskProof> => {
    const res = await API.post("/ghost-tasks/verify", payload);
    return res.data;
  },

  getMyProofs: async (): Promise<GhostTaskProof[]> => {
    const res = await API.get("/ghost-tasks/proofs/me");
    return res.data;
  },
};
