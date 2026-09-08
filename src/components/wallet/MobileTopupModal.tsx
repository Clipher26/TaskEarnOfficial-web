"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, MobileTopupOrder } from "@/api/fintechApi";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";

const PROVIDERS = [
  { id: "MTN", name: "MTN", flag: "🇳🇬" },
  { id: "AIRTEL", name: "Airtel", flag: "🇳🇬" },
  { id: "GLO", name: "Glo", flag: "🇳🇬" },
  { id: "SAFARICOM", name: "Safaricom", flag: "🇰🇪" },
];

export const MobileTopupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { mobileTopupOrders, setMobileTopupOrders } = useAppStore();
  const [provider, setProvider] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      const data = await fintechApi.getTopupOrders();
      setMobileTopupOrders(data);
    } catch (err) {
      console.error("Failed to fetch topup orders", err);
    }
  };

  const handleSubmit = async () => {
    if (!provider || !phone || !amount) return;
    setSubmitting(true);
    try {
      const order = await fintechApi.createTopupOrder({
        provider,
        phone_number: phone,
        amount_usdt: parseFloat(amount),
      });
      setMobileTopupOrders([order, ...mobileTopupOrders]);
      setPhone("");
      setAmount("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create topup order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Mobile Top-Up</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Select Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    provider === p.id
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <span className="mr-1">{p.flag}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Amount (USDT)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            Purchase Top-Up
          </button>

          {mobileTopupOrders.length > 0 && (
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Recent Orders</h4>
              <div className="space-y-2">
                {mobileTopupOrders.slice(0, 5).map((order: MobileTopupOrder) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950 border border-gray-800">
                    <div>
                      <p className="text-xs font-bold text-white">{order.provider}</p>
                      <p className="text-[10px] text-gray-400">{order.phone_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-400">{order.local_amount.toLocaleString()} {order.local_currency}</p>
                      <p className="text-[10px] text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
