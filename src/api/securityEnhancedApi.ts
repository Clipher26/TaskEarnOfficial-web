import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/security`,
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

export interface VerificationStatus {
  user_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  verification_tier: string;
  kyc_status: string;
  last_verification?: string;
}

export interface TwoFactorSetupResponse {
  method: string;
  secret?: string;
  qr_code?: string;
  recovery_codes?: string[];
  phone?: string;
  code_sent?: boolean;
}

export interface DeviceResponse {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  os: string;
  browser: string;
  ip_address?: string;
  last_active?: string;
  is_trusted: boolean;
  is_primary: boolean;
  created_at: string;
  revoked_at?: string;
}

export interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  data?: Record<string, any>;
  status: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface PrivacySettings {
  user_id: string;
  profile_visibility: string;
  show_earnings: boolean;
  show_achievements: boolean;
  show_activity: boolean;
  allow_messages: boolean;
  share_data_for_stats: boolean;
  show_referral_link: boolean;
}

export const securityApi = {
  getVerificationStatus: async (): Promise<VerificationStatus> => {
    const { data } = await API.get("/verification/status");
    return data;
  },

  verifyEmail: async (code: string): Promise<{ verified: boolean; tier: string }> => {
    const { data } = await API.post("/verification/email", { code });
    return data;
  },

  verifyPhone: async (phone: string, code: string): Promise<{ verified: boolean; tier: string }> => {
    const { data } = await API.post("/verification/phone", { phone, code });
    return data;
  },

  verifyIdDocument: async (documentUrl: string, documentType: string): Promise<{ verified: boolean; tier: string }> => {
    const { data } = await API.post("/verification/id", { document_url: documentUrl, document_type: documentType });
    return data;
  },

  verifyKYC: async (idUrl: string, selfieUrl: string, addressUrl: string, firstName: string, lastName: string, dateOfBirth: string, country: string): Promise<{ verified: boolean; tier: string }> => {
    const { data } = await API.post("/verification/kyc", { id_url: idUrl, selfie_url: selfieUrl, address_url: addressUrl, first_name: firstName, last_name: lastName, date_of_birth: dateOfBirth, country });
    return data;
  },

  setup2FA: async (method: string): Promise<TwoFactorSetupResponse> => {
    const { data } = await API.post("/2fa/setup", { method });
    return data;
  },

  verify2FA: async (method: string, code: string): Promise<{ verified: boolean }> => {
    const { data } = await API.post("/2fa/verify", { method, code });
    return data;
  },

  disable2FA: async (code: string): Promise<{ success: boolean }> => {
    const { data } = await API.post("/2fa/disable", { code });
    return data;
  },

  getRecoveryCodes: async (): Promise<{ recovery_codes: string[] }> => {
    const { data } = await API.get("/2fa/recovery");
    return data;
  },

  listDevices: async (): Promise<DeviceResponse[]> => {
    const { data } = await API.get("/devices");
    return data.devices || [];
  },

  registerDevice: async (deviceId: string, deviceName: string, deviceType: string, os: string, browser: string, ipAddress: string): Promise<DeviceResponse> => {
    const { data } = await API.post("/devices", { device_id: deviceId, device_name: deviceName, device_type: deviceType, os, browser, ip_address: ipAddress });
    return data;
  },

  revokeDevice: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await API.delete(`/devices/${deviceId}`);
    return data;
  },

  trustDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    const { data } = await API.put(`/devices/${deviceId}/trust`);
    return data;
  },

  getSecurityAlerts: async (): Promise<SecurityAlert[]> => {
    const { data } = await API.get("/alerts");
    return data.alerts || [];
  },

  analyzeFraud: async (transactionId: string, userId: string, amount: number, transactionType: string, ipAddress: string): Promise<{ transaction_id: string; fraud_score: number; risk_level: string; flags: string[]; requires_verification: boolean; action: string }> => {
    const { data } = await API.post("/fraud/analyze", { transaction_id: transactionId, user_id: userId, amount, transaction_type: transactionType, ip_address: ipAddress });
    return data;
  },

  checkTransactionLimits: async (transactionType: string, amount: number): Promise<{ allowed: boolean; error?: string; remaining?: Record<string, number> }> => {
    const { data } = await API.post("/limits/check", { transaction_type: transactionType, amount });
    return data;
  },

  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const { data } = await API.get("/privacy");
    return data;
  },

  updatePrivacySettings: async (settings: Partial<PrivacySettings>): Promise<PrivacySettings> => {
    const { data } = await API.put("/privacy", settings);
    return data;
  },

  exportUserData: async (): Promise<{ download_url: string; expires_at: string; file_size: number; data_categories: string[] }> => {
    const { data } = await API.post("/privacy/export");
    return data;
  },

  deleteAccount: async (): Promise<{ success: boolean; deletion_date: string; message: string }> => {
    const { data } = await API.post("/privacy/delete");
    return data;
  },
};
