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

export interface RedTeamVault {
  id: string;
  title: string;
  description: string;
  system_prompt: string;
  entry_fee: number;
  reward_pool: number;
  status: "LOCKED" | "ATTEMPTED" | "BREACHED" | "COMPLETED";
  difficulty: string;
  max_attempts?: number;
  current_attempts: number;
  breach_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface RedTeamAttempt {
  id: string;
  vault_id: string;
  user_id: string;
  prompt: string;
  response?: string;
  leaked_secret: boolean;
  tokens_used?: number;
  latency_ms?: number;
  reward_credited: boolean;
  reward_tx_id?: string;
  created_at?: string;
}

export const redTeamApi = {
  listVaults: async (): Promise<RedTeamVault[]> => {
    const res = await API.get("/red-team/vaults");
    return res.data;
  },

  getVault: async (vaultId: string): Promise<RedTeamVault> => {
    const res = await API.get(`/red-team/vaults/${vaultId}`);
    return res.data;
  },

  createVault: async (payload: {
    title: string;
    description: string;
    system_prompt: string;
    secret_passphrase: string;
    entry_fee: number;
    difficulty?: string;
    max_attempts?: number;
  }): Promise<RedTeamVault> => {
    const res = await API.post("/red-team/vaults", payload);
    return res.data;
  },

  attemptVault: async (vaultId: string, prompt: string): Promise<RedTeamAttempt> => {
    const res = await API.post(`/red-team/vaults/${vaultId}/attempt`, { vault_id: vaultId, prompt });
    return res.data;
  },

  getMyAttempts: async (): Promise<RedTeamAttempt[]> => {
    const res = await API.get("/red-team/attempts/me");
    return res.data;
  },
};
