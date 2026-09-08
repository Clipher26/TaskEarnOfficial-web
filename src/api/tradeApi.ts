import { BACKEND_BASE_URL } from "@/lib/api";

export interface BybitOrderbookLevel {
  price: string;
  size: string;
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

export interface BybitBalance {
  coin: string;
  equity: string;
  available_balance: string;
  cross_wallet_balance: string;
  max_withdraw_amount: string;
  locked?: string;
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

export interface BybitOrder {
  order_id: string;
  symbol: string;
  side: string;
  order_type: string;
  qty: string;
  price?: string;
  order_status: string;
  created_time?: string;
}

async function getAuthHeaders() {
  const session = await (await import("@/lib/api")).supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session.data.session?.access_token || ""}`,
  };
}

export async function getBybitTicker(symbol: string): Promise<BybitTicker> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/market/tickers/${symbol}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch ticker");
  }
  return await response.json();
}

export async function getBybitPositions(symbol?: string): Promise<BybitPosition[]> {
  const headers = await getAuthHeaders();
  const url = symbol
    ? `${BACKEND_BASE_URL}/api/v1/bybit/account/positions?symbol=${encodeURIComponent(symbol)}`
    : `${BACKEND_BASE_URL}/api/v1/bybit/account/positions`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch positions");
  }
  return await response.json();
}

export async function getBybitBalance(): Promise<BybitBalance | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/account/balance`, { headers });
  if (!response.ok) {
    return null;
  }
  return await response.json();
}

export async function executeBybitTrade(params: {
  symbol: string;
  side: "BUY" | "SELL";
  order_type?: "MARKET" | "LIMIT";
  qty: string;
  leverage: number;
  take_profit?: number;
  stop_loss?: number;
  price?: string;
  reduce_only?: boolean;
}): Promise<BybitTradeResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/trade/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      symbol: params.symbol,
      side: params.side,
      order_type: params.order_type ? params.order_type.charAt(0) + params.order_type.slice(1).toLowerCase() : "Market",
      qty: params.qty,
      leverage: params.leverage,
      take_profit: params.take_profit,
      stop_loss: params.stop_loss,
      price: params.price,
      reduce_only: params.reduce_only || false,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Order execution failed");
  }
  return await response.json();
}

export async function closeBybitPosition(symbol: string, qty?: string): Promise<BybitTradeResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/trade/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      symbol,
      qty: qty || "0",
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to close position");
  }
  return await response.json();
}

export async function getBybitOpenOrders(symbol: string): Promise<{ result?: { list?: BybitOrder[] } }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/orders/open?symbol=${encodeURIComponent(symbol)}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch open orders");
  }
  return await response.json();
}

export async function getBybitOrderHistory(symbol: string, limit: number = 50): Promise<{ result?: { list?: BybitOrder[] } }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/orders/history?symbol=${encodeURIComponent(symbol)}&limit=${limit}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch order history");
  }
  return await response.json();
}

export async function getBybitOrderBook(symbol: string, limit: number = 25): Promise<{ bids: BybitOrderbookLevel[]; asks: BybitOrderbookLevel[] }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/market/orderbook/${symbol}?limit=${limit}`, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch order book");
  }
  return await response.json();
}

export interface BybitInstrumentSummary {
  symbol: string;
  contract_type: string;
  status: string;
  min_qty: string;
  max_leverage: string;
  price_precision: number;
  qty_precision: number;
}

export async function getBybitInstruments(): Promise<BybitInstrumentSummary[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/bybit/market/instruments`, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch instruments");
  }
  const data = await response.json();
  return data.list || [];
}
