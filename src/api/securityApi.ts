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

export interface ProofValidation {
  id: string;
  conversion_id: string;
  user_id: string;
  image_hash?: string;
  ai_risk_score?: number;
  ai_status: string;
  ai_feedback?: string;
  human_status?: string;
  human_feedback?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceFingerprintStatus {
  fingerprint?: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_emulator: boolean;
  risk_score: number;
  vpn_risk_level: string;
  connection_type?: string;
  country?: string;
  city?: string;
  is_blocked: boolean;
}

export interface VPNDetectionLog {
  id: string;
  user_id?: string;
  ip_address: string;
  risk_level: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  provider_name?: string;
  country?: string;
  city?: string;
  connection_type?: string;
  detected_at: string;
}

export interface AdvertiserAutoTopUp {
  id: string;
  advertiser_id: string;
  payment_gateway: string;
  gateway_customer_id?: string;
  gateway_payment_method_id?: string;
  threshold_usd: number;
  top_up_amount_usd: number;
  max_balance_usd?: number;
  status: string;
  last_triggered_at?: string;
  total_top_ups: number;
  total_topped_up_usd: number;
  created_at: string;
  updated_at: string;
}

export interface GeoTarget {
  id: string;
  campaign_id: string;
  target_type: string;
  target_value: string;
  is_exclusion: boolean;
  created_at: string;
}

export interface WebhookTest {
  id: string;
  advertiser_id: string;
  webhook_id?: string;
  test_event: string;
  payload_sent: any;
  response_status?: number;
  response_body?: string;
  status: string;
  error_message?: string;
  tested_at: string;
}

export interface AdvertiserBadge {
  id: string;
  advertiser_id: string;
  badge_type: string;
  description?: string;
  is_visible: boolean;
  awarded_at: string;
}

export interface ABTest {
  id: string;
  campaign_id: string;
  variant_a_title: string;
  variant_b_title: string;
  status: string;
  winner_variant?: string;
  confidence_level?: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface BlacklistEntry {
  id: string;
  user_id: string;
  advertiser_id: string;
  reason?: string;
  created_at: string;
}

export interface HoneypotAttempt {
  id: string;
  user_id: string;
  task_id: string;
  question_id: string;
  correct_answer: string;
  user_answer: string;
  is_bot_detected: boolean;
  ip_address?: string;
  device_fingerprint?: string;
  user_agent?: string;
  created_at: string;
}

export interface SecurityStats {
  total_proof_validations: number;
  pending_proof_validations: number;
  rejected_by_ai: number;
  blocked_vpn_users: number;
  blocked_emulators: number;
  active_auto_topups: number;
  total_badges_awarded: number;
  active_ab_tests: number;
  total_blacklist_entries: number;
  detected_bots: number;
}

export const securityApi = {
  getProofValidations: async (user_id?: string, limit = 50, offset = 0): Promise<ProofValidation[]> => {
    const res = await API.get("/api/security/proof-validations", { params: { user_id, limit, offset } });
    return res.data;
  },

  reviewProof: async (validation_id: string, human_status: string, feedback?: string) => {
    const res = await API.post(`/api/security/proof-validations/${validation_id}/review`, { human_status, feedback });
    return res.data;
  },

  getDeviceFingerprintStatus: async (): Promise<DeviceFingerprintStatus> => {
    const res = await API.get("/api/security/device-fingerprint");
    return res.data;
  },

  registerDeviceFingerprint: async (fingerprint_data: any) => {
    const res = await API.post("/api/security/device-fingerprint/register", fingerprint_data);
    return res.data;
  },

  getVPNLogs: async (user_id?: string, limit = 50, offset = 0): Promise<VPNDetectionLog[]> => {
    const res = await API.get("/api/security/vpn-logs", { params: { user_id, limit, offset } });
    return res.data;
  },

  detectVPN: async (ip_address: string) => {
    const res = await API.post("/api/security/vpn/detect", { ip_address });
    return res.data;
  },

  createAutoTopUp: async (payload: { advertiser_id: string; threshold_usd?: number; top_up_amount_usd?: number; max_balance_usd?: number; payment_gateway?: string }): Promise<AdvertiserAutoTopUp> => {
    const res = await API.post("/api/security/advertiser/auto-topup", payload);
    return res.data;
  },

  getAutoTopUp: async (advertiser_id: string): Promise<AdvertiserAutoTopUp> => {
    const res = await API.get(`/api/security/advertiser/auto-topup/${advertiser_id}`);
    return res.data;
  },

  triggerAutoTopUp: async (advertiser_id: string) => {
    const res = await API.post(`/api/security/advertiser/auto-topup/${advertiser_id}/trigger`);
    return res.data;
  },

  createGeoTarget: async (payload: { campaign_id: string; target_type: string; target_value: string; is_exclusion?: boolean }): Promise<GeoTarget> => {
    const res = await API.post("/api/security/geo-targets", payload);
    return res.data;
  },

  getGeoTargets: async (campaign_id: string): Promise<GeoTarget[]> => {
    const res = await API.get(`/api/security/geo-targets/${campaign_id}`);
    return res.data;
  },

  deleteGeoTarget: async (geo_id: string) => {
    const res = await API.delete(`/api/security/geo-targets/${geo_id}`);
    return res.data;
  },

  testWebhook: async (payload: { advertiser_id: string; webhook_id?: string; test_event: string; payload_sent: any }): Promise<WebhookTest> => {
    const res = await API.post("/api/security/webhook-tests", payload);
    return res.data;
  },

  getWebhookTests: async (advertiser_id: string, limit = 50, offset = 0): Promise<WebhookTest[]> => {
    const res = await API.get(`/api/security/webhook-tests/${advertiser_id}`, { params: { limit, offset } });
    return res.data;
  },

  getAdvertiserBadges: async (advertiser_id: string): Promise<AdvertiserBadge[]> => {
    const res = await API.get(`/api/security/advertiser/badges/${advertiser_id}`);
    return res.data;
  },

  evaluateAdvertiserBadges: async (advertiser_id: string): Promise<AdvertiserBadge[]> => {
    const res = await API.post(`/api/security/advertiser/badges/evaluate/${advertiser_id}`);
    return res.data;
  },

  createABTest: async (payload: { campaign_id: string; variant_a_title: string; variant_b_title: string }): Promise<ABTest> => {
    const res = await API.post("/api/security/ab-tests", payload);
    return res.data;
  },

  getABTests: async (campaign_id?: string, status?: string): Promise<ABTest[]> => {
    const res = await API.get("/api/security/ab-tests", { params: { campaign_id, status } });
    return res.data;
  },

  recordABImpression: async (ab_test_id: string, variant: string) => {
    const res = await API.post(`/api/security/ab-tests/${ab_test_id}/impression`, { variant });
    return res.data;
  },

  addToBlacklist: async (payload: { user_id: string; advertiser_id: string; reason?: string }): Promise<BlacklistEntry> => {
    const res = await API.post("/api/security/blacklist", payload);
    return res.data;
  },

  removeFromBlacklist: async (entry_id: string) => {
    const res = await API.delete(`/api/security/blacklist/${entry_id}`);
    return res.data;
  },

  getBlacklist: async (user_id?: string, advertiser_id?: string): Promise<BlacklistEntry[]> => {
    const res = await API.get("/api/security/blacklist", { params: { user_id, advertiser_id } });
    return res.data;
  },

  checkHoneypot: async (payload: { task_id: string; question_id: string; correct_answer: string; user_answer: string; ip_address?: string; device_fingerprint?: string; user_agent?: string }): Promise<HoneypotAttempt> => {
    const res = await API.post("/api/security/honeypot/check", payload);
    return res.data;
  },

  getHoneypotAttempts: async (user_id?: string, limit = 50, offset = 0): Promise<HoneypotAttempt[]> => {
    const res = await API.get("/api/security/honeypot/attempts", { params: { user_id, limit, offset } });
    return res.data;
  },

  getSecurityStats: async (): Promise<SecurityStats> => {
    const res = await API.get("/api/security/stats");
    return res.data;
  },

  getSecurityOverview: async () => {
    const res = await API.get("/api/security/overview");
    return res.data;
  },
};
