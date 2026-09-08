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

export interface LiveStream {
  id: string;
  title: string;
  platform: "TWITCH" | "YOUTUBE";
  stream_url: string;
  thumbnail_url?: string;
  streamer_name: string;
  is_active: boolean;
  drop_interval_minutes: number;
  drop_amount_tcoin: number;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
}

export interface StreamViewer {
  id: string;
  stream_id: string;
  user_id: string;
  total_watch_seconds: number;
  last_reward_at?: string;
  created_at: string;
}

export interface StreamReward {
  id: string;
  stream_id: string;
  user_id: string;
  amount_tcoin: number;
  watch_seconds: number;
  claimed: boolean;
  created_at: string;
}

export const streamsApi = {
  listStreams: async (): Promise<{ streams: LiveStream[] }> => {
    const res = await API.get("/streams/");
    return res.data;
  },
  startWatching: async (streamId: string): Promise<{ viewer: StreamViewer }> => {
    const res = await API.post(`/streams/${streamId}/start`);
    return res.data;
  },
  recordWatch: async (streamId: string, watchSeconds: number) => {
    const res = await API.post(`/streams/${streamId}/watch`, null, { params: { watch_seconds: watchSeconds } });
    return res.data;
  },
  listRewards: async (): Promise<{ rewards: StreamReward[] }> => {
    const res = await API.get("/streams/rewards");
    return res.data;
  },
};
