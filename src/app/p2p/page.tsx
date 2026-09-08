"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Plus, RefreshCw } from "lucide-react";
import { P2POrderCard } from "@/components/p2p/P2POrderCard";
import { CreateOrderModal } from "@/components/p2p/CreateOrderModal";
import { OrderDetailModal } from "@/components/p2p/OrderDetailModal";
import { p2pApi, P2POrder } from "@/api/p2pApi";
import { getTelegramUser, triggerHaptic } from "@/lib/telegram";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function P2PPage() {
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { isLoggedIn, isLoading: authLoading } = useRequireAuth();

  const tgUser = getTelegramUser();
  const currentUserId = tgUser?.id ? `user_${tgUser.id}` : "";

  const fetchOrders = async () => {
    try {
      const data = await p2pApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch P2P orders:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleCreateOrder = async (data: {
    amount_crypto: number;
    amount_fiat: number;
    fiat_currency: string;
    payment_method_used?: string;
  }) => {
    triggerHaptic("light");
    try {
      const newOrder = await p2pApi.createOrder({
        seller_id: currentUserId,
        ...data,
      });
      setOrders((prev) => [newOrder, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const handleAccept = async (orderId: string) => {
    triggerHaptic("medium");
    try {
      const updated = await p2pApi.acceptOrder(orderId, currentUserId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelectedOrder(updated);
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  const handlePaymentSent = async (orderId: string) => {
    triggerHaptic("medium");
    try {
      const updated = await p2pApi.markPaymentSent(orderId, currentUserId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelectedOrder(updated);
    } catch (error) {
      console.error("Failed to mark payment sent:", error);
    }
  };

  const handleRelease = async (orderId: string) => {
    triggerHaptic("heavy");
    try {
      const updated = await p2pApi.releaseEscrow(orderId, currentUserId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelectedOrder(updated);
    } catch (error) {
      console.error("Failed to release escrow:", error);
    }
  };

  const handleDispute = async (orderId: string) => {
    const reason = prompt("Enter dispute reason:");
    if (!reason) return;
    triggerHaptic("heavy");
    try {
      const dispute = await p2pApi.raiseDispute(orderId, currentUserId, reason);
      console.log("Dispute raised:", dispute);
      await fetchOrders();
    } catch (error) {
      console.error("Failed to raise dispute:", error);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">P2P Escrow</h1>
                <p className="text-[10px] text-gray-400">Secure peer-to-peer trading</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchOrders();
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => {
                  triggerHaptic("light");
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">No P2P orders yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Create your first order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <P2POrderCard
                key={order.id}
                order={order}
                currentUserId={currentUserId}
                onAccept={handleAccept}
                onPaymentSent={handlePaymentSent}
                onRelease={handleRelease}
                onDispute={handleDispute}
              />
            ))}
          </div>
        )}
      </main>

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrder}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        currentUserId={currentUserId}
        onAccept={handleAccept}
        onPaymentSent={handlePaymentSent}
        onRelease={handleRelease}
        onDispute={handleDispute}
      />
    </div>
  );
}
