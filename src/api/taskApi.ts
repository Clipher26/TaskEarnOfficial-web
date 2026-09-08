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

export interface UserSurveyProfile {
  id: string;
  user_id: string;
  age?: number;
  employment_status?: string;
  country: string;
  city?: string;
  education_level?: string;
  interests?: string;
  household_income?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDispute {
  id: string;
  user_id: string;
  offer_id?: string;
  conversion_id?: string;
  reason: string;
  evidence_urls: string[];
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED_USER" | "RESOLVED_ADVERTISER" | "CLOSED";
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface TaskReminder {
  id: string;
  user_id: string;
  category: string;
  min_payout_usd?: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskSpeedrun {
  id: string;
  conversion_id: string;
  user_id: string;
  offer_id: string;
  time_spent_seconds: number;
  average_time_seconds: number;
  bonus_pct: number;
  bonus_awarded: boolean;
  created_at: string;
}

export interface GroupTaskPool {
  id: string;
  offer_id: string;
  required_participants: number;
  current_participants: number;
  group_payout_multiplier: number;
  window_start: string;
  window_end: string;
  status: "OPEN" | "FILLED" | "EXPIRED" | "CANCELLED";
  created_at: string;
}

export interface TaskPreview {
  id: string;
  offer_id: string;
  preview_type: string;
  preview_url: string;
  caption?: string;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  user_id: string;
  offer_id: string;
  conversion_id?: string;
  task_type: "STANDARD" | "AUDIO_VOICE" | "AI_ANNOTATION" | "GEO_FENCED" | "GROUP_POOL" | "SURVEY";
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED" | "DISPUTED";
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AutoFillSurveyResult {
  filled: boolean;
  data?: Record<string, any>;
  reason?: string;
}

export interface AvailableTask {
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

export const taskApi = {
  surveyProfile: {
    get: async (): Promise<UserSurveyProfile> => {
      const res = await API.get("/tasks/survey-profile");
      return res.data;
    },
    upsert: async (payload: {
      age?: number;
      employment_status?: string;
      country: string;
      city?: string;
      education_level?: string;
      interests?: string;
      household_income?: string;
    }): Promise<UserSurveyProfile> => {
      const res = await API.post("/tasks/survey-profile", payload);
      return res.data;
    },
  },

  autoFillSurvey: async (payload: { offer_id: string; answers: Record<string, any> }): Promise<AutoFillSurveyResult> => {
    const res = await API.post("/tasks/auto-fill-survey", payload);
    return res.data;
  },

  disputes: {
    list: async (): Promise<TaskDispute[]> => {
      const res = await API.get("/tasks/disputes");
      return res.data;
    },
    create: async (payload: {
      offer_id?: string;
      conversion_id?: string;
      reason: string;
      evidence_urls?: string[];
    }): Promise<TaskDispute> => {
      const res = await API.post("/tasks/disputes", payload);
      return res.data;
    },
    update: async (disputeId: string, payload: { status: string; resolution?: string }): Promise<TaskDispute> => {
      const res = await API.patch(`/tasks/disputes/${disputeId}`, payload);
      return res.data;
    },
  },

  reminders: {
    list: async (): Promise<TaskReminder[]> => {
      const res = await API.get("/tasks/reminders");
      return res.data;
    },
    create: async (payload: { category: string; min_payout_usd?: number }): Promise<TaskReminder> => {
      const res = await API.post("/tasks/reminders", payload);
      return res.data;
    },
    toggle: async (reminderId: string, isActive: boolean): Promise<{ success: boolean }> => {
      const res = await API.patch(`/tasks/reminders/${reminderId}/toggle?is_active=${isActive}`);
      return res.data;
    },
    delete: async (reminderId: string): Promise<{ success: boolean }> => {
      const res = await API.delete(`/tasks/reminders/${reminderId}`);
      return res.data;
    },
  },

  groupPools: {
    list: async (status?: string): Promise<GroupTaskPool[]> => {
      const res = await API.get(`/tasks/group-pools${status ? `?status=${status}` : ""}`);
      return res.data;
    },
    create: async (payload: {
      offer_id: string;
      required_participants?: number;
      group_payout_multiplier?: number;
      window_hours?: number;
    }): Promise<GroupTaskPool> => {
      const res = await API.post("/tasks/group-pools", payload);
      return res.data;
    },
    join: async (poolId: string): Promise<GroupTaskPool> => {
      const res = await API.post("/tasks/group-pools/join", { pool_id: poolId });
      return res.data;
    },
  },

  previews: async (offerId: string): Promise<TaskPreview[]> => {
    const res = await API.get(`/tasks/previews/${offerId}`);
    return res.data;
  },

  submissions: {
    list: async (): Promise<TaskSubmission[]> => {
      const res = await API.get("/tasks/submissions");
      return res.data;
    },
    create: async (payload: { offer_id: string; task_type?: string; metadata?: Record<string, any> }): Promise<TaskSubmission> => {
      const res = await API.post("/tasks/submissions", payload);
      return res.data;
    },
    update: async (submissionId: string, payload: { status: string; metadata?: Record<string, any> }): Promise<TaskSubmission> => {
      const res = await API.patch(`/tasks/submissions/${submissionId}`, payload);
      return res.data;
    },
  },

  audioSubmit: async (payload: { submission_id: string; audio_url: string; duration_seconds: number }): Promise<{ success: boolean }> => {
    const res = await API.post("/tasks/audio/submit", payload);
    return res.data;
  },

  annotationSubmit: async (payload: { submission_id: string; annotation_data: Record<string, any>; image_url: string }): Promise<{ success: boolean }> => {
    const res = await API.post("/tasks/annotation/submit", payload);
    return res.data;
  },

  geoSubmit: async (payload: {
    submission_id: string;
    latitude: number;
    longitude: number;
    image_url: string;
    address?: string;
  }): Promise<{ success: boolean }> => {
    const res = await API.post("/tasks/geo/submit", payload);
    return res.data;
  },

  speedruns: async (): Promise<TaskSpeedrun[]> => {
    const res = await API.get("/tasks/speedruns");
    return res.data;
  },

  availableTasks: async (country = "ALL", category?: string): Promise<{ tasks: AvailableTask[]; source: string }> => {
    const res = await API.get(`/tasks/available?country=${country}${category ? `&category=${category}` : ""}`);
    return res.data;
  },
};
