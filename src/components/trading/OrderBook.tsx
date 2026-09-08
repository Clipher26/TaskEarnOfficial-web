"use client";

import React from "react";

export interface OrderBookLevel {
  price: string;
  size: string;
}

interface OrderBookProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  maxSize?: number;
}

export function OrderBook({ bids, asks, maxSize = 100 }: OrderBookProps) {
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const formatSize = (size: string) => {
    const num = parseFloat(size);
    if (isNaN(num)) return "0.0000";
    return num.toFixed(4);
  };

  const getDepthPercent = (size: string, max: number) => {
    const num = parseFloat(size);
    if (isNaN(num) || max <= 0) return 0;
    return Math.min((num / max) * 100, 100);
  };

  const maxBidSize = Math.max(...bids.map((b) => parseFloat(b.size) || 0), 1);
  const maxAskSize = Math.max(...asks.map((a) => parseFloat(a.size) || 0), 1);
  const overallMax = Math.max(maxBidSize, maxAskSize, 1);

  const spread =
    asks.length > 0 && bids.length > 0
      ? (parseFloat(asks[0]?.price || "0") - parseFloat(bids[0]?.price || "0")).toFixed(2)
      : "0.00";

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Book</h3>
        <span className="text-[10px] text-slate-500 font-mono">
          Spread: <span className="text-slate-300">{spread}</span>
        </span>
      </div>

      <div className="flex-1 grid grid-rows-2 min-h-0">
        {/* Asks - reversed so lowest ask is at bottom */}
        <div className="flex flex-col-reverse overflow-hidden">
          {asks.slice(0, 8).map((ask, idx) => {
            const depth = getDepthPercent(ask.size, overallMax);
            return (
              <div
                key={`ask-${idx}`}
                className="relative flex items-center px-3 py-1 text-[11px] font-mono hover:bg-rose-500/5 transition-colors"
              >
                <div
                  className="absolute inset-0 bg-rose-500/5"
                  style={{ width: `${depth}%`, right: 0, left: "auto" }}
                />
                <span className="relative text-rose-400 w-20 truncate">{formatPrice(ask.price)}</span>
                <span className="relative text-slate-300 flex-1 text-right mr-2">{formatSize(ask.size)}</span>
              </div>
            );
          })}
        </div>

        {/* Current price */}
        <div className="flex items-center justify-center py-1 border-y border-slate-800 bg-slate-900/50">
          <span className="text-sm font-bold text-white font-mono">
            {asks.length > 0 ? formatPrice(asks[0].price) : "0.00"}
          </span>
        </div>

        {/* Bids */}
        <div className="flex flex-col overflow-hidden">
          {bids.slice(0, 8).map((bid, idx) => {
            const depth = getDepthPercent(bid.size, overallMax);
            return (
              <div
                key={`bid-${idx}`}
                className="relative flex items-center px-3 py-1 text-[11px] font-mono hover:bg-emerald-500/5 transition-colors"
              >
                <div
                  className="absolute inset-0 bg-emerald-500/5"
                  style={{ width: `${depth}%`, left: 0 }}
                />
                <span className="relative text-emerald-400 w-20 truncate">{formatPrice(bid.price)}</span>
                <span className="relative text-slate-300 flex-1 text-right mr-2">{formatSize(bid.size)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
