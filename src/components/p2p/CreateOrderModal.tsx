"use client";

import React, { useState } from "react";
import { X, ShieldCheck } from "lucide-react";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount_crypto: number; amount_fiat: number; fiat_currency: string; payment_method_used?: string }) => void;
  isLoading?: boolean;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [amountCrypto, setAmountCrypto] = useState("");
  const [amountFiat, setAmountFiat] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("NGN");
  const [paymentMethod, setPaymentMethod] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const crypto = parseFloat(amountCrypto);
    const fiat = parseFloat(amountFiat);
    if (!crypto || !fiat || crypto <= 0 || fiat <= 0) return;

    onSubmit({
      amount_crypto: crypto,
      amount_fiat: fiat,
      fiat_currency: fiatCurrency,
      payment_method_used: paymentMethod || undefined,
    });

    setAmountCrypto("");
    setAmountFiat("");
    setPaymentMethod("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-white">Create P2P Order</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Crypto Amount (USDT)</label>
            <input
              type="number"
              value={amountCrypto}
              onChange={(e) => setAmountCrypto(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Fiat Amount</label>
            <input
              type="number"
              value={amountFiat}
              onChange={(e) => setAmountFiat(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Fiat Currency</label>
            <select
              value={fiatCurrency}
              onChange={(e) => setFiatCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="KES">KES</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Payment Method (optional)</label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. Bank Transfer, PayPal"
              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !amountCrypto || !amountFiat}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all active:scale-95"
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
};
