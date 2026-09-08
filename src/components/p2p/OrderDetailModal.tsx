"use client";

import React, { useState } from "react";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  } | null;
  currentUserId: string;
  onAccept?: (orderId: string) => void;
  onPaymentSent?: (orderId: string) => void;
  onRelease?: (orderId: string) => void;
  onDispute?: (orderId: string, reason: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  currentUserId,
  onAccept,
  onPaymentSent,
  onRelease,
  onDispute,
}) => {
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  if (!isOpen || !order) return null;

  const isSeller = order.seller_id === currentUserId;
  const isBuyer = order.buyer_id === currentUserId;

  const handleDispute = () => {
    if (!disputeReason.trim()) return;
    onDispute?.(order.id, disputeReason);
    setDisputeReason("");
    setShowDispute(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-white">Order Details</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
              <p className="text-[10px] text-gray-500">Crypto</p>
              <p className="text-sm font-bold text-white">{order.amount_crypto.toFixed(6)} USDT</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
              <p className="text-[10px] text-gray-500">Fiat</p>
              <p className="text-sm font-bold text-white">
                {order.amount_fiat.toLocaleString()} {order.fiat_currency}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Status</span>
              <span className="text-white font-semibold">{order.status}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Payment</span>
              <span className="text-gray-300">{order.payment_method_used || "N/A"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Seller</span>
              <span className="text-gray-300 font-mono text-[10px]">
                {order.seller_id.slice(0, 8)}...
              </span>
            </div>
            {order.buyer_id && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Buyer</span>
                <span className="text-gray-300 font-mono text-[10px]">
                  {order.buyer_id.slice(0, 8)}...
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {order.status === "OPEN" && !isSeller && (
              <button
                onClick={() => onAccept?.(order.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                Accept Order
              </button>
            )}
            {order.status === "IN_ESCROW" && isBuyer && (
              <button
                onClick={() => onPaymentSent?.(order.id)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                Mark Paid
              </button>
            )}
            {order.status === "PAYMENT_SENT" && isSeller && (
              <button
                onClick={() => onRelease?.(order.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                Release Escrow
              </button>
            )}
            {["IN_ESCROW", "PAYMENT_SENT"].includes(order.status) && (isBuyer || isSeller) && (
              <button
                onClick={() => setShowDispute(true)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                Dispute
              </button>
            )}
          </div>

          {showDispute && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-semibold">Raise Dispute</span>
              </div>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDispute(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispute}
                  disabled={!disputeReason.trim()}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
