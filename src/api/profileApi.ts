import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}`,
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

export interface ProfileSkin {
  id: string;
  code: string;
  name: string;
  skin_type: "FRAME" | "GLOW" | "AVATAR";
  price_tcoin: number;
  preview_image_url?: string;
  css_class?: string;
  is_limited: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserProfileCustomization {
  id: string;
  skin_id: string;
  code: string;
  name: string;
  skin_type: "FRAME" | "GLOW" | "AVATAR";
  price_tcoin: number;
  css_class?: string;
  is_equipped: boolean;
  purchased_at?: string;
}

export const profileApi = {
  listSkins: async (): Promise<{ skins: ProfileSkin[] }> => {
    const res = await API.get("/api/v1/profile/skins");
    return res.data;
  },
  getUserCustomizations: async (): Promise<{ customizations: UserProfileCustomization[] }> => {
    const res = await API.get("/api/v1/profile/customizations");
    return res.data;
  },
  purchaseSkin: async (skinId: string) => {
    const res = await API.post(`/api/v1/profile/skins/${skinId}/purchase`);
    return res.data;
  },
  equipSkin: async (customizationId: string) => {
    const res = await API.post(`/api/v1/profile/customizations/${customizationId}/equip`);
    return res.data;
  },
};
