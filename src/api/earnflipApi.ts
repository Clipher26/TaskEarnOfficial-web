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

export type TaskDifficulty = "EASY" | "MEDIUM" | "HARD";
export type TaskPlatform = "YOUTUBE" | "TWITTER" | "INSTAGRAM" | "TIKTOK" | "TELEGRAM" | "WEB" | "MOBILE";
export type EarnflipTaskStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "VERIFIED" | "REJECTED" | "UNDER_REVIEW";

export interface EarnflipTask {
  id: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  platform: TaskPlatform;
  reward_amount: number;
  reward_currency: string;
  instructions?: string;
  proof_type: string;
  estimated_duration_minutes?: number;
  max_participants?: number;
  total_completions: number;
  status: EarnflipTaskStatus;
  anti_bot_checks?: string;
  metadata?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnflipSubmission {
  id: string;
  task_id: string;
  user_id: string;
  status: SubmissionStatus;
  proof_data?: string;
  proof_urls?: string[];
  anti_bot_passed?: boolean;
  anti_bot_details?: string;
  review_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reward_credited: boolean;
  reward_tx_id?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnflipTaskFilters {
  difficulty?: TaskDifficulty;
  platform?: TaskPlatform;
  status?: EarnflipTaskStatus;
  search?: string;
  page: number;
  limit: number;
}

export const earnflipApi = {
  listTasks: async (filters: Partial<EarnflipTaskFilters> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await API.get(`/earnflip/tasks?${params.toString()}`);
    return res.data;
  },

  getTask: async (taskId: string): Promise<EarnflipTask> => {
    const res = await API.get(`/earnflip/tasks/${taskId}`);
    return res.data;
  },

  createTask: async (payload: {
    title: string;
    description: string;
    difficulty: TaskDifficulty;
    platform: TaskPlatform;
    reward_amount: number;
    reward_currency?: string;
    instructions?: string;
    proof_type: string;
    estimated_duration_minutes?: number;
    max_participants?: number;
    anti_bot_checks?: string;
    metadata?: string;
    expires_at?: string;
  }): Promise<EarnflipTask> => {
    const res = await API.post("/earnflip/tasks", payload);
    return res.data;
  },

  updateTask: async (taskId: string, payload: Partial<EarnflipTask>): Promise<EarnflipTask> => {
    const res = await API.patch(`/earnflip/tasks/${taskId}`, payload);
    return res.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await API.delete(`/earnflip/tasks/${taskId}`);
  },

  submitTask: async (taskId: string, payload: {
    proof_data?: string;
    proof_urls?: string[];
    anti_bot_token?: string;
    started_at?: string;
  }): Promise<EarnflipSubmission> => {
    const res = await API.post(`/earnflip/tasks/${taskId}/submit`, { ...payload, task_id: taskId });
    return res.data;
  },

  getMySubmissions: async (): Promise<EarnflipSubmission[]> => {
    const res = await API.get("/earnflip/submissions/me");
    return res.data;
  },

  updateSubmission: async (submissionId: string, payload: Partial<EarnflipSubmission>): Promise<EarnflipSubmission> => {
    const res = await API.patch(`/earnflip/submissions/${submissionId}`, payload);
    return res.data;
  },
};
