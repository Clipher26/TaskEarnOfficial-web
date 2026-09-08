import axios from "axios";
import { AutoWithdrawalRule, SavingsVault, GiftCardRedemption, PayoutSplit, TransactionReceipt, DebitCardWaitlist, MobileTopupOrder, Arbitrator, GaslessCashout } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/fintech`,
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

export type {
  AutoWithdrawalRule,
  SavingsVault,
  GiftCardRedemption,
  PayoutSplit,
  TransactionReceipt,
  DebitCardWaitlist,
  MobileTopupOrder,
  Arbitrator,
  GaslessCashout,
};

export const fintechApi = {
  getAutoWithdrawRules: async (): Promise<AutoWithdrawalRule[]> => {
    const res = await API.get("/auto-withdraw/rules");
    return res.data;
  },
  createAutoWithdrawRule: async (payload: {
    trigger_type: string;
    threshold_amount?: number;
    currency: string;
    destination_type: string;
    destination_details?: string;
  }): Promise<AutoWithdrawalRule> => {
    const res = await API.post("/auto-withdraw/rules", payload);
    return res.data;
  },
  deleteAutoWithdrawRule: async (ruleId: string): Promise<void> => {
    await API.delete(`/auto-withdraw/rules/${ruleId}`);
  },
  getVaults: async (): Promise<SavingsVault[]> => {
    const res = await API.get("/vaults");
    return res.data;
  },
  createVault: async (payload: { amount: number; tier: string; apy_rate?: number }): Promise<SavingsVault> => {
    const res = await API.post("/vaults", payload);
    return res.data;
  },
  claimVaultRewards: async (vaultId: string): Promise<{ vault_id: string; reward: number; status: string }> => {
    const res = await API.post(`/vaults/${vaultId}/claim`);
    return res.data;
  },
  getGiftCards: async (): Promise<GiftCardRedemption[]> => {
    const res = await API.get("/gift-cards");
    return res.data;
  },
  redeemGiftCard: async (payload: {
    provider: string;
    amount_usdt: number;
    denomination: string;
    recipient_email?: string;
    recipient_phone?: string;
  }): Promise<GiftCardRedemption> => {
    const res = await API.post("/gift-cards/redeem", payload);
    return res.data;
  },
  getArbitrators: async (): Promise<Arbitrator[]> => {
    const res = await API.get("/arbitrators");
    return res.data;
  },
  assignArbitrator: async (orderId: string): Promise<any> => {
    const res = await API.post(`/p2p/orders/${orderId}/assign-arbitrator`);
    return res.data;
  },
  getPayoutSplit: async (): Promise<PayoutSplit | null> => {
    const res = await API.get("/payout-split");
    return res.data;
  },
  createPayoutSplit: async (payload: { splits: Record<string, number> }): Promise<PayoutSplit> => {
    const res = await API.post("/payout-split", payload);
    return res.data;
  },
  getReceipts: async (): Promise<TransactionReceipt[]> => {
    const res = await API.get("/receipts");
    return res.data;
  },
  createReceipt: async (payload: { receipt_type: string; period_start: string; period_end: string }): Promise<TransactionReceipt> => {
    const res = await API.post("/receipts", payload);
    return res.data;
  },
  getWaitlistEntry: async (): Promise<DebitCardWaitlist | null> => {
    const res = await API.get("/debit-card/waitlist");
    return res.data;
  },
  joinWaitlist: async (payload: {
    full_name: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    phone?: string;
    perks_tier?: string;
    notes?: string;
  }): Promise<DebitCardWaitlist> => {
    const res = await API.post("/debit-card/waitlist", payload);
    return res.data;
  },
  getTopupOrders: async (): Promise<MobileTopupOrder[]> => {
    const res = await API.get("/mobile-topup/orders");
    return res.data;
  },
  createTopupOrder: async (payload: { provider: string; phone_number: string; amount_usdt: number }): Promise<MobileTopupOrder> => {
    const res = await API.post("/mobile-topup/orders", payload);
    return res.data;
  },
  gaslessCashout: async (payload: { amount: number; network: string; destination_address: string }): Promise<GaslessCashout> => {
    const res = await API.post("/cashout/gasless", payload);
    return res.data;
  },
  convertCurrency: async (payload: { from_currency: string; to_currency: string; amount: number }): Promise<{
    from_currency: string;
    to_currency: string;
    amount: number;
    converted_amount: number;
    rate: number;
  }> => {
    const res = await API.post("/currency/convert", payload);
    return res.data;
  },
};
