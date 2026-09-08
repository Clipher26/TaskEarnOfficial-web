"use client";

import React, { useState } from "react";
import { Plus, X, ShieldCheck, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface P2POrderCardProps {
  order: {
    id: string;
    seller_id: string;
    buyer_id?: string;
    amount_crypto: number;
    amount_fiat: number;
    fiat_currency: string;
    status: string;
    payment_method_used?: string;
    created_at: string;
  };
  currentUserId: string;
  onAccept?: (orderId: string) => void;
  onPaymentSent?: (orderId: string) => void;
  onRelease?: (orderId: string) => void;
  onDispute?: (orderId: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  IN_ESCROW: { label: "In Escrow", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  PAYMENT_SENT: { label: "Payment Sent", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  RELEASED: { label: "Released", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  CANCELLED: { label: "Cancelled", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
  DISPUTED: { label: "Disputed", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
};

export const P2POrderCard: React.FC<P2POrderCardProps> = ({
  order,
  currentUserId,
  onAccept,
  onPaymentSent,
  onRelease,
  onDispute,
}) => {
  const isSeller = order.seller_id === currentUserId;
  const isBuyer = order.buyer_id === currentUserId;
  const statusInfo = statusConfig[order.status] || statusConfig.OPEN;

  const canAccept = order.status === "OPEN" && !isSeller;
  const canMarkPaid = order.status === "IN_ESCROW" && isBuyer;
  const canRelease = order.status === "PAYMENT_SENT" && isSeller;
  const canDispute = ["IN_ESCROW", "PAYMENT_SENT"].includes(order.status) && (isBuyer || isSeller);

  return (
    <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-white">P2P Trade</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Crypto Amount</span>
          <span className="text-white font-semibold">{order.amount_crypto.toFixed(6)} USDT</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Fiat Amount</span>
          <span className="text-white font-semibold">
            {order.amount_fiat.toLocaleString()} {order.fiat_currency}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Payment</span>
          <span className="text-gray-300">{order.payment_method_used || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Role</span>
          <span className="text-gray-300">{isSeller ? "Seller" : isBuyer ? "Buyer" : "Observer"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {canAccept && (
          <button
            onClick={() => onAccept?.(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <ArrowDownLeft size={14} />
            Accept Order
          </button>
        )}
        {canMarkPaid && (
          <button
            onClick={() => onPaymentSent?.(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <ArrowUpRight size={14} />
            Mark Paid
          </button>
        )}
        {canRelease && (
          <button
            onClick={() => onRelease?.(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <ShieldCheck size={14} />
            Release
          </button>
        )}
        {canDispute && (
          <button
            onClick={() => onDispute?.(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            Dispute
          </button>
        )}
      </div>
    </div>
  );
};
