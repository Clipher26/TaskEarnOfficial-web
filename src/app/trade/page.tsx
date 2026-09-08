"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { TrendingUp, ArrowUpDown, Zap, BarChart3, Wallet, History, X, Activity, Crown, Lock } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { OrderBook } from "@/components/trading/OrderBook";
import {
  getBybitTicker,
  getBybitPositions,
  getBybitBalance,
  executeBybitTrade,
  closeBybitPosition,
  getBybitOpenOrders,
  getBybitOrderHistory,
  getBybitOrderBook,
  BybitTicker,
  BybitPosition,
  BybitBalance,
  BybitOrder,
  BybitOrderbookLevel,
} from "@/api/tradeApi";

const TIER_ORDER = ["FREE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "ELITE_TRADER"];

function hasMinTier(userTier: string, minTier: string): boolean {
  const userIdx = TIER_ORDER.indexOf(userTier);
  const minIdx = TIER_ORDER.indexOf(minTier);
  return userIdx >= minIdx;
}

type Tab = "trade" | "positions" | "orders";

export default function TradePage() {
  const { setActiveModule, signals, user } = useAppStore();
  const { isLoggedIn, isLoading } = useRequireAuth();

  const vipTier = user?.vip_tier || "FREE";
  const canAccess = hasMinTier(vipTier, "BRONZE");

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [qty, setQty] = useState("50");
  const [leverage, setLeverage] = useState(10);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("trade");

  const [ticker, setTicker] = useState<BybitTicker | null>(null);
  const [positions, setPositions] = useState<BybitPosition[]>([]);
  const [balance, setBalance] = useState<BybitBalance | null>(null);
  const [openOrders, setOpenOrders] = useState<BybitOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<BybitOrder[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: BybitOrderbookLevel[]; asks: BybitOrderbookLevel[] }>({ bids: [], asks: [] });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("trade");
  }, [isLoggedIn, isLoading]);

  if (!isLoggedIn && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-white">Trade Terminal</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <Lock size={32} className="text-orange-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Bronze Tier Required</h2>
          <p className="text-sm text-slate-400 mb-4">Upgrade to Bronze VIP to unlock live crypto trading.</p>
          <button
            onClick={() => window.location.href = "/vip"}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Crown size={16} />
            View VIP Tiers
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const fetchMarketData = useCallback(async () => {
    try {
      const [tickerData, positionsData, balanceData, obData] = await Promise.all([
        getBybitTicker(symbol),
        getBybitPositions(symbol),
        getBybitBalance(),
        getBybitOrderBook(symbol, 25),
      ]);
      setTicker(tickerData);
      setPositions(positionsData || []);
      setBalance(balanceData);
      setOrderBook(obData);
    } catch (e) {
      console.error("Failed to fetch market data", e);
    }
  }, [symbol]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchMarketData();
  }, [symbol, isLoggedIn, fetchMarketData]);

  useEffect(() => {
    if (activeTab === "orders") {
      getBybitOpenOrders(symbol).then((data) => {
        setOpenOrders(data?.result?.list || []);
      });
      getBybitOrderHistory(symbol, 50).then((data) => {
        setOrderHistory(data?.result?.list || []);
      });
    }
  }, [activeTab, symbol]);

  const handleTrade = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await executeBybitTrade({
        symbol,
        side,
        order_type: orderType,
        qty,
        leverage,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
        price: orderType === "LIMIT" ? limitPrice : undefined,
      });

      if (result.success) {
        setSuccess(`Order placed: ${side} ${symbol} - Order ID: ${result.order_id}`);
        fetchMarketData();
      } else {
        setError(result.message || "Order failed");
      }
    } catch (e: any) {
      setError(e.message || "Order execution failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionSymbol: string, positionQty: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await closeBybitPosition(positionSymbol, positionQty);
      if (result.success) {
        setSuccess(`Position closed: ${positionSymbol}`);
        fetchMarketData();
      } else {
        setError(result.message || "Failed to close position");
      }
    } catch (e: any) {
      setError(e.message || "Failed to close position");
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = ticker ? parseFloat(ticker.last_price) : 0;
  const priceChange = ticker ? parseFloat(ticker.price_change_24h || "0") : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Trade Terminal</h1>
                <p className="text-[10px] text-slate-400">Bybit Spot & Futures</p>
              </div>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
              </select>
            </div>

            <div className="flex items-center gap-6">
              {ticker && (
                <div className="text-right">
                  <p className="text-xl font-bold text-white font-mono">${currentPrice.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {priceChange >= 0 ? "+" : ""}{(priceChange * 100).toFixed(2)}%
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                <Wallet size={14} className="text-cyan-400" />
                <span className="text-sm font-mono text-cyan-400">
                  ${balance ? parseFloat(balance.available_balance).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)}><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Main Trading Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Left Column - Order Book */}
          <div className="hidden lg:block lg:col-span-3 h-full">
            <OrderBook bids={orderBook.bids} asks={orderBook.asks} />
          </div>

          {/* Center Column - Chart + Bottom Panel */}
          <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 min-h-0">
            {/* Chart */}
            <div className="flex-1 min-h-0">
              <TradingViewChart symbol={symbol} />
            </div>

            {/* Bottom Panel */}
            <div className="h-64 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex items-center gap-1 p-2 border-b border-slate-800">
                {(["positions", "orders"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {tab === "positions" ? "Positions" : "Orders"}
                  </button>
                ))}
              </div>

              <div className="p-3 overflow-auto h-[calc(100%-45px)]">
                {activeTab === "positions" && (
                  <div className="space-y-2">
                    {positions.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No open positions.</p>
                    ) : (
                      positions.map((pos, idx) => (
                        <div key={idx} className="bg-slate-950/60 rounded-lg border border-slate-800 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-white">{pos.symbol}</p>
                              <p className={`text-[10px] font-medium ${pos.side === "Buy" ? "text-emerald-400" : "text-rose-400"}`}>
                                {pos.side}
                              </p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              OPEN
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 block">Size</span>
                              <span className="text-white font-mono">{parseFloat(pos.size).toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Entry</span>
                              <span className="text-white font-mono">${parseFloat(pos.entry_price).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Mark</span>
                              <span className="text-white font-mono">${parseFloat(pos.mark_price).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">PnL</span>
                              <span className={`font-mono ${parseFloat(pos.unrealized_pnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {parseFloat(pos.unrealized_pnl) >= 0 ? "+" : ""}{parseFloat(pos.unrealized_pnl).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleClosePosition(pos.symbol, pos.size)}
                            disabled={loading}
                            className="mt-2 w-full py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-500/20 transition-all disabled:opacity-50"
                          >
                            Close Position
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-2">
                    {openOrders.length === 0 && orderHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No orders.</p>
                    ) : (
                      <>
                        {openOrders.map((order: any) => (
                          <div key={order.order_id} className="bg-slate-950/60 rounded-lg border border-slate-800 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="text-sm font-bold text-white">{order.symbol}</p>
                                <p className={`text-[10px] font-medium ${order.side === "Buy" ? "text-emerald-400" : "text-rose-400"}`}>
                                  {order.side} {order.order_type}
                                </p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                OPEN
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Qty</span>
                                <span className="text-white font-mono">{parseFloat(order.qty).toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Price</span>
                                <span className="text-white font-mono">${parseFloat(order.price || "0").toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Status</span>
                                <span className="text-amber-400 font-mono">{order.order_status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {orderHistory.map((order: any) => (
                          <div key={order.order_id} className="bg-slate-950/60 rounded-lg border border-slate-800 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="text-sm font-bold text-white">{order.symbol}</p>
                                <p className={`text-[10px] font-medium ${order.side === "Buy" ? "text-emerald-400" : "text-rose-400"}`}>
                                  {order.side} {order.order_type}
                                </p>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                order.order_status === "Filled" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                order.order_status === "Cancelled" ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {order.order_status}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Qty</span>
                                <span className="text-white font-mono">{parseFloat(order.qty).toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Price</span>
                                <span className="text-white font-mono">${parseFloat(order.price || "0").toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Time</span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {order.created_time ? new Date(parseInt(order.created_time) * 1000).toLocaleTimeString() : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Form */}
          <div className="col-span-1 lg:col-span-3 h-full">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 h-full overflow-auto">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Order Form</h2>
              </div>

              <div className="space-y-3">
                {/* Buy/Sell Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSide("BUY")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      side === "BUY"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Long
                  </button>
                  <button
                    onClick={() => setSide("SELL")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      side === "SELL"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    Short
                  </button>
                </div>

                {/* Market/Limit */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType("MARKET")}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                      orderType === "MARKET"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType("LIMIT")}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                      orderType === "LIMIT"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Limit
                  </button>
                </div>

                {/* Limit Price */}
                {orderType === "LIMIT" && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Limit Price (USDT)</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Quantity ({symbol.replace("USDT", "")})</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="0.00"
                  />
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setQty(pct.toString())}
                        className="flex-1 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leverage */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Leverage: {leverage}x</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1x</span>
                    <span>5x</span>
                    <span>10x</span>
                  </div>
                </div>

                {/* TP/SL */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Take Profit</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Stop Loss</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleTrade}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                    side === "BUY"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Executing..." : `${side === "BUY" ? "Long" : "Short"} ${symbol}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
