import axios from "axios";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${FASTAPI_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: "USER" | "ADMIN" | "VIP";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  referral_code?: string;
  profile_image_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
  link_token?: string;
  link_url?: string;
}

export interface RegisterPayload {
  full_name: string;
  username: string;
  email: string;
  password: string;
  referral_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await API.post("/auth/register", payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await API.post("/auth/login", payload);
    return res.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  uploadProfileImage: async (file: File): Promise<{ profile_image_url: string }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await API.post("/auth/upload-profile-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
