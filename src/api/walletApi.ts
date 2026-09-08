import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}`,
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
      // ignore supabase session fetch errors
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

export interface WalletBalances {
  usdt_balance: number;
  tcoin_balance: number;
  ngn_balance: number;
  escrow_balance: number;
  tcoin_usd_value: number;
}

export interface CryptoDepositPayload {
  amount: number;
  network: "BSC-BEP20" | "TRON-TRC20" | "BTC";
  tx_hash?: string;
}

export interface BankDepositPayload {
  amount_ngn: number;
  selected_account_number: string;
  payment_proof_url: string;
}

export interface PaystackDepositPayload {
  amount_ngn: number;
  email?: string;
}

export interface WithdrawalPayload {
  amount: number;
  currency: "USDT" | "NGN";
  method?: "CRYPTO_EXTERNAL" | "BANK_TRANSFER" | "GIFT_CARD";
  destination_crypto_address?: string;
  crypto_network?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  gift_card_provider?: "AMAZON" | "GOOGLE_PLAY" | "STEAM" | "APPLE" | "BITREFILL";
  gift_card_denomination?: string;
  recipient_email?: string;
  recipient_phone?: string;
}

export interface ConversionPayload {
  amount: number;
  conversion_type: "USDT_TO_TCOIN" | "TCOIN_TO_USDT";
}

export interface ConversionResponse {
  conversion_id: string;
  conversion_type: string;
  usdt_amount: number | null;
  tcoin_amount: number | null;
  rate_used: number;
  status: string;
  created_at: string;
}

export interface ConversionHistoryItem {
  id: string;
  conversion_type: string;
  usdt_amount: number | null;
  tcoin_amount: number | null;
  rate_used: number;
  status: string;
  created_at: string;
}

export interface CryptoDepositOption {
  network: string;
  token: string;
  deposit_address: string;
}

export interface BankDepositOption {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface DepositOptionsResponse {
  crypto_options: CryptoDepositOption[];
  bank_accounts: BankDepositOption[];
  paystack_public_key?: string;
  contact_details?: string[];
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  reference: string;
}

export interface DepositHistoryItem {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  tx_hash?: string;
  payment_proof_url?: string;
  assigned_address?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  fee_amount: number;
  net_amount: number;
  admin_note?: string;
  created_at: string;
}

export interface DepositProofUpload {
  deposit_id: string;
  proof_url: string;
  tx_hash?: string;
}

export const walletApi = {
  getBalances: async (): Promise<WalletBalances> => {
    const res = await API.get("/api/v1/wallet/balances");
    return res.data;
  },
  getExchangeRates: async () => {
    const res = await API.get("/api/v1/wallet/exchange-rates");
    return res.data;
  },
  getDepositOptions: async (): Promise<DepositOptionsResponse> => {
    const res = await API.get("/api/v1/wallet/deposit-options");
    return res.data;
  },
  getWithdrawalMethod: async () => {
    const res = await API.get("/api/v1/wallet/withdrawal-method");
    return res.data;
  },
  setWithdrawalMethod: async (payload: {
    method: "CRYPTO_EXTERNAL" | "BANK_TRANSFER";
    tron_usdt_address?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
  }) => {
    const res = await fetch("/api/v1/wallet/withdrawal-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(typeof window !== "undefined" && localStorage.getItem("access_token")
          ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data?.detail || "Failed to save withdrawal method");
      err.response = { data, status: res.status };
      throw err;
    }
    return data;
  },
  getDepositHistory: async (limit: number = 20, offset: number = 0): Promise<DepositHistoryItem[]> => {
    const res = await API.get(`/api/v1/wallet/deposits?limit=${limit}&offset=${offset}`);
    return res.data;
  },
  uploadDepositProof: async (payload: DepositProofUpload) => {
    const res = await API.post(`/api/v1/wallet/deposits/${payload.deposit_id}/proof`, payload);
    return res.data;
  },
  submitCryptoDeposit: async (payload: CryptoDepositPayload) => {
    const res = await API.post("/api/v1/wallet/deposit/crypto", payload);
    return res.data;
  },
  submitBankDeposit: async (payload: BankDepositPayload) => {
    const res = await API.post("/api/v1/wallet/deposit/bank-transfer", payload);
    return res.data;
  },
  initializePaystackDeposit: async (payload: PaystackDepositPayload): Promise<PaystackInitializeResponse> => {
    const res = await API.post("/api/v1/wallet/deposit/paystack/initialize", payload);
    return res.data;
  },
  verifyPaystackDeposit: async (reference: string) => {
    const res = await API.get(`/api/v1/wallet/deposit/paystack/verify/${reference}`);
    return res.data;
  },
  submitWithdrawal: async (payload: WithdrawalPayload) => {
    const res = await API.post("/api/v1/wallet/withdraw", payload);
    return res.data;
  },
  getBitrefillProducts: async () => {
    const res = await API.get("/api/v1/wallet/bitrefill/products");
    return res.data;
  },
  convertCurrency: async (payload: ConversionPayload): Promise<ConversionResponse> => {
    const res = await API.post("/api/v1/wallet/convert", payload);
    return res.data;
  },
  getConversionHistory: async (): Promise<ConversionHistoryItem[]> => {
    const res = await API.get("/api/v1/wallet/conversion-history");
    return res.data;
  },
};
