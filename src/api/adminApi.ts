import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const ADMIN_API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

ADMIN_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ADMIN_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("access_token");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export interface AdminStats {
  total_users: number;
  active_users: number;
  active_tasks: number;
  pending_deposits_count: number;
  pending_withdrawals_count: number;
  total_usdt_volume: number;
  total_ngn_volume: number;
  total_tcoin_volume: number;
  pending_campaigns: number;
  pending_disputes: number;
  total_deposit_fees: number;
  total_withdrawal_fees: number;
  total_fees_earned: number;
  total_referral_commissions: number;
  referral_commission_count: number;
}

export interface PendingDeposit {
  deposit_id: string;
  user_id: string;
  user_email: string;
  amount_ngn: number;
  currency: string;
  account_number: string;
  bank_name: string;
  proof_url: string;
  status: string;
  created_at: string;
}

export interface PendingWithdrawal {
  withdrawal_id: string;
  user_id: string;
  user_email: string;
  amount: number;
  currency: string;
  method: string;
  destination_address: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  gift_card_provider?: string;
  gift_card_denomination?: string;
  recipient_email?: string;
  exchange_rate_used?: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  risk_flags: string[];
  admin_note?: string;
  processing_note?: string;
  created_at: string;
}

export interface UserAccountInfo {
  user_id: string;
  email: string;
  telegram_username?: string;
  role: string;
  status: string;
  is_2fa_enabled: boolean;
  usdt_balance: number;
  tcoin_balance: number;
  ngn_balance: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_email: string;
  action: string;
  target_id?: string;
  target_type?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface ReferralCommissionResponse {
  id: string;
  user_id: string;
  user_email: string;
  referrer_id: string;
  referrer_email: string;
  amount_usdt: number;
  fee_type: string;
  source_id: string;
  created_at: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "FINANCE_MANAGER" | "MODERATOR";
  is_active: boolean;
  referral_code?: string;
  created_at: string;
}

export interface TradingSignalResponse {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry_price: number;
  tp1?: number;
  tp2?: number;
  stop_loss?: number;
  indicator_reason?: string;
  status: string;
  created_at: string;
}

export interface TradeMetricsResponse {
  total_trades: number;
  open_trades: number;
  closed_trades: number;
  total_pnl: number;
  win_rate: number;
  total_volume_usdt: number;
  active_bots: number;
}

export interface VipUserInfo {
  user_id: string;
  email: string;
  vip_tier: string;
  vip_level: number;
  task_multiplier: number;
  trading_fee_rate: number;
  xp_points: number;
  current_streak: number;
  created_at: string;
}

export const getAdminRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_role");
};

export const isSuperAdmin = (): boolean => {
  return getAdminRole() === "SUPER_ADMIN";
};

export interface DepositMethodConfig {
  id: string;
  method_type: "CRYPTO" | "BANK" | "PAYSTACK";
  label: string;
  is_active: boolean;
  crypto_network?: string;
  crypto_token?: string;
  deposit_address?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_instructions?: string;
  admin_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const adminApi = {
  login: async (email: string, password: string) => {
    const res = await ADMIN_API.post("/admin/auth/login", { email, password });
    return res.data;
  },

  getUserToken: async () => {
    const res = await ADMIN_API.get("/admin/auth/user-token");
    return res.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const res = await ADMIN_API.get("/admin/dashboard/stats");
    return res.data;
  },

  getPendingDeposits: async (): Promise<PendingDeposit[]> => {
    const res = await ADMIN_API.get("/admin/deposits/pending");
    return res.data;
  },

  reviewDeposit: async (depositId: string, approved: boolean, reason?: string) => {
    const res = await ADMIN_API.post("/admin/deposits/review", {
      deposit_id: depositId,
      approved,
      rejection_reason: reason,
    });
    return res.data;
  },

  getPendingWithdrawals: async (): Promise<PendingWithdrawal[]> => {
    const res = await ADMIN_API.get("/admin/withdrawals/pending");
    return res.data;
  },

  reviewWithdrawal: async (withdrawalId: string, approved: boolean, reason?: string) => {
    const res = await ADMIN_API.post("/admin/withdrawals/review", {
      withdrawal_id: withdrawalId,
      approved,
      rejection_reason: reason,
    });
    return res.data;
  },

  listUsers: async (search = "", statusFilter = "", limit = 50, offset = 0): Promise<UserAccountInfo[]> => {
    const res = await ADMIN_API.get("/admin/users", {
      params: { search, status_filter: statusFilter, limit, offset },
    });
    return res.data;
  },

  getUserDetail: async (userId: string): Promise<UserAccountInfo> => {
    const res = await ADMIN_API.get(`/admin/users/${userId}`);
    return res.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await ADMIN_API.patch("/admin/users/status", { user_id: userId, status });
    return res.data;
  },

  adjustBalance: async (userId: string, currency: string, amount: number, reason: string) => {
    const res = await ADMIN_API.post("/admin/users/adjust-balance", {
      user_id: userId,
      currency,
      amount,
      reason,
    });
    return res.data;
  },

  getAuditLogs: async (limit = 100, offset = 0): Promise<AuditLogEntry[]> => {
    const res = await ADMIN_API.get("/admin/audit-logs", { params: { limit, offset } });
    return res.data;
  },

  getAdmins: async (): Promise<AdminUserResponse[]> => {
    const res = await ADMIN_API.get("/admin/admins");
    return res.data;
  },

  createAdmin: async (email: string, password: string, role: "SUPER_ADMIN" | "FINANCE_MANAGER" | "MODERATOR" = "MODERATOR") => {
    const res = await ADMIN_API.post("/admin/admins", { email, password, role });
    return res.data;
  },

  getRates: async () => {
    const res = await ADMIN_API.get("/admin/rates");
    return res.data;
  },

  updateRates: async (payload: { tcoin_to_usdt_rate?: number; fee_rate_trade?: number; fee_rate_earnpoly?: number }) => {
    const res = await ADMIN_API.post("/admin/rates", payload);
    return res.data;
  },

  getSignals: async (symbol = "", status = "", limit = 50): Promise<TradingSignalResponse[]> => {
    const res = await ADMIN_API.get("/admin/signals", { params: { symbol, status, limit } });
    return res.data;
  },

  createSignal: async (payload: { symbol: string; direction: "BUY" | "SELL"; entry_price: number; tp1?: number; tp2?: number; stop_loss?: number; indicator_reason?: string }) => {
    const res = await ADMIN_API.post("/admin/signals", payload);
    return res.data;
  },

  updateSignal: async (signalId: string, payload: { symbol: string; direction: "BUY" | "SELL"; entry_price: number; tp1?: number; tp2?: number; stop_loss?: number; indicator_reason?: string }) => {
    const res = await ADMIN_API.patch(`/admin/signals/${signalId}`, payload);
    return res.data;
  },

  cancelSignal: async (signalId: string) => {
    const res = await ADMIN_API.delete(`/admin/signals/${signalId}`);
    return res.data;
  },

  activateSignal: async (signalId: string) => {
    const res = await ADMIN_API.post(`/admin/signals/${signalId}/activate`);
    return res.data;
  },

  getTradeMetrics: async (): Promise<TradeMetricsResponse> => {
    const res = await ADMIN_API.get("/admin/trades/metrics");
    return res.data;
  },

  getTrades: async (limit = 50, offset = 0) => {
    const res = await ADMIN_API.get("/admin/trades", { params: { limit, offset } });
    return res.data;
  },

  getVipUsers: async (tier = "", limit = 50): Promise<VipUserInfo[]> => {
    const res = await ADMIN_API.get("/admin/vip/users", { params: { tier, limit } });
    return res.data;
  },

  adjustVip: async (userId: string, payload: { vip_tier: string; vip_level?: number; task_multiplier?: number; trading_fee_rate?: number }) => {
    const res = await ADMIN_API.patch(`/admin/vip/users/${userId}`, payload);
    return res.data;
  },

  getUserWithdrawalMethod: async (userId: string) => {
    const res = await ADMIN_API.get(`/admin/users/${userId}/withdrawal-method`);
    return res.data;
  },

  unlockUserWithdrawalMethod: async (userId: string) => {
    const res = await ADMIN_API.patch(`/admin/users/${userId}/withdrawal-method/unlock`);
    return res.data;
  },

  updateWithdrawalStatus: async (withdrawalId: string, status: string, adminNote?: string, processingNote?: string) => {
    const res = await ADMIN_API.patch(`/admin/withdrawals/${withdrawalId}/status`, {
      status,
      admin_note: adminNote,
      processing_note: processingNote,
    });
    return res.data;
  },

  getReferralCommissions: async (limit = 100, offset = 0): Promise<ReferralCommissionResponse[]> => {
    const res = await ADMIN_API.get("/admin/referral/commissions", { params: { limit, offset } });
    return res.data;
  },

  // Deposit Method Management

  listDepositMethods: async (params?: { method_type?: string; include_inactive?: boolean }): Promise<DepositMethodConfig[]> => {
    const res = await ADMIN_API.get("/admin/deposit-methods", { params });
    return res.data;
  },

  createDepositMethod: async (payload: {
    method_type: string;
    label: string;
    is_active?: boolean;
    crypto_network?: string;
    crypto_token?: string;
    deposit_address?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_instructions?: string;
  }): Promise<DepositMethodConfig> => {
    const res = await ADMIN_API.post("/admin/deposit-methods", payload);
    return res.data;
  },

  updateDepositMethod: async (id: string, payload: Partial<{
    method_type: string;
    label: string;
    is_active: boolean;
    crypto_network: string;
    crypto_token: string;
    deposit_address: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    contact_email: string;
    contact_phone: string;
    contact_instructions: string;
  }>): Promise<DepositMethodConfig> => {
    const res = await ADMIN_API.patch(`/admin/deposit-methods/${id}`, payload);
    return res.data;
  },

  deleteDepositMethod: async (id: string): Promise<{ status: string; message: string }> => {
    const res = await ADMIN_API.delete(`/admin/deposit-methods/${id}`);
    return res.data;
  },
};
