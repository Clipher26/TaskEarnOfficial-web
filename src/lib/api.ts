import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface VirtualWallet {
  user_id: string;
  available_balance_usdt: number;
  locked_margin_usdt: number;
  platform_credits: number;
  streak_count: number;
  vip_tier: number;
}

export interface Signal {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry_price: number;
  tp1?: number;
  tp2?: number;
  stop_loss?: number;
  indicator_reason?: string;
  status: "ACTIVE" | "HIT_TP1" | "HIT_TP2" | "HIT_SL" | "CANCELLED";
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  allocated_margin: number;
  leverage: number;
  entry_price: number;
  exit_price?: number;
  pnl: number;
  status: "OPEN" | "CLOSED" | "LIQUIDATED";
  created_at: string;
  closed_at?: string;
}

export async function executeTrade(params: {
  userId: string;
  symbol: string;
  side: "BUY" | "SELL";
  margin: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
}) {
  const session = (await supabase.auth.getSession()).data.session;

  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/trade/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({
      symbol: params.symbol,
      side: params.side,
      order_type: "Market",
      qty: String(params.margin),
      leverage: params.leverage,
      take_profit: params.takeProfit,
      stop_loss: params.stopLoss,
      reduce_only: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Order execution failed");
  }

  return await response.json();
}

export async function getWallet(userId: string): Promise<VirtualWallet | null> {
  const { data } = await supabase
    .from("user_virtual_wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data as VirtualWallet | null;
}

export async function getTrades(userId: string): Promise<Trade[]> {
  const { data } = await supabase
    .from("internal_user_trades")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data as Trade[]) || [];
}

export async function getSignals(): Promise<Signal[]> {
  const { data } = await supabase
    .from("trading_signals")
    .select("*")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data as Signal[]) || [];
}

export async function getQuests(): Promise<any[]> {
  const { data } = await supabase
    .from("tasks_and_quests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

export async function getTournaments(): Promise<any[]> {
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .neq("status", "ENDED")
    .order("start_time", { ascending: false })
    .limit(10);

  return data || [];
}

export async function getP2POffers(): Promise<any[]> {
  const { data } = await supabase
    .from("p2p_offers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

export interface BybitTicker {
  symbol: string;
  last_price: string;
  mark_price: string;
  index_price: string;
  high_price_24h?: string;
  low_price_24h?: string;
  volume_24h?: string;
  turnover_24h?: string;
  price_change_24h?: string;
}

export interface BybitPosition {
  symbol: string;
  side: string;
  size: string;
  leverage: string;
  entry_price: string;
  mark_price: string;
  liq_price: string;
  unrealized_pnl: string;
  status: string;
}

export interface BybitTradeResult {
  success: boolean;
  order_id?: string;
  symbol: string;
  side: string;
  qty: string;
  price?: string;
  message?: string;
}

export async function getBybitTicker(symbol: string): Promise<BybitTicker> {
  const session = (await supabase.auth.getSession()).data.session;
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/market/tickers/${symbol}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch ticker");
  }

  return await response.json();
}

export async function getBybitPositions(symbol?: string): Promise<BybitPosition[]> {
  const session = (await supabase.auth.getSession()).data.session;
  const url = symbol
    ? `${BACKEND_BASE_URL}/api/v1/bybit/account/positions?symbol=${encodeURIComponent(symbol)}`
    : `${BACKEND_BASE_URL}/api/v1/bybit/account/positions`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch positions");
  }

  return await response.json();
}

export async function getBybitBalance(): Promise<BybitBalance | null> {
  const session = (await supabase.auth.getSession()).data.session;
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/account/balance`, {
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

export async function executeBybitTrade(params: {
  symbol: string;
  side: "BUY" | "SELL";
  order_type?: "Market" | "Limit";
  qty: string;
  leverage: number;
  take_profit?: number;
  stop_loss?: number;
  price?: string;
}): Promise<BybitTradeResult> {
  const session = (await supabase.auth.getSession()).data.session;

  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/trade/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      symbol: params.symbol,
      side: params.side,
      order_type: params.order_type || "Market",
      qty: params.qty,
      leverage: params.leverage,
      take_profit: params.take_profit,
      stop_loss: params.stop_loss,
      price: params.price,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Order execution failed");
  }

  return await response.json();
}

export async function closeBybitPosition(symbol: string, qty?: string): Promise<BybitTradeResult> {
  const session = (await supabase.auth.getSession()).data.session;

  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/trade/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      symbol,
      qty,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to close position");
  }

  return await response.json();
}

export interface BybitBalance {
  coin: string;
  equity: string;
  available_balance: string;
  cross_wallet_balance: string;
  max_withdraw_amount: string;
}

export async function getBybitOpenOrders(symbol: string) {
  const session = (await supabase.auth.getSession()).data.session;
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/orders/open?symbol=${encodeURIComponent(symbol)}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch open orders");
  }

  return await response.json();
}

export async function getBybitOrderHistory(symbol: string, limit: number = 50) {
  const session = (await supabase.auth.getSession()).data.session;
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/orders/history?symbol=${encodeURIComponent(symbol)}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order history");
  }

  return await response.json();
}

