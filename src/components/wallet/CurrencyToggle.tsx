"use client";

import React, { useState } from "react";
import { WalletBalances } from "@/api/walletApi";

interface CurrencyToggleProps {
  balances: WalletBalances | null;
  onConvert: (toCurrency: string) => void;
}

type Currency = "USD" | "TCOIN" | "NGN" | "USDT";

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ balances, onConvert }) => {
  const [activeCurrency, setActiveCurrency] = useState<Currency>("USD");
  const [converted, setConverted] = useState<{ usdt: number; tcoin: number; ngn: number; rate: number } | null>(null);

  const handleToggle = async (currency: Currency) => {
    setActiveCurrency(currency);
    if (currency === "USD" || currency === "USDT") {
      setConverted(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/fintech/currency/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_currency: "USD", to_currency: currency, amount: 1 }),
      });
      const data = await res.json();
      setConverted(data);
    } catch (err) {
      console.error("Conversion failed", err);
    }
  };

  const formatValue = () => {
    if (!balances) return "0.00";
    if (activeCurrency === "USD" || activeCurrency === "USDT") {
      return `$${Number(balances.usdt_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    }
    if (activeCurrency === "TCOIN") {
      const rate = converted?.rate || 1 / 30;
      return `${(Number(balances.usdt_balance) * rate).toLocaleString("en-US", { maximumFractionDigits: 0 })} TC`;
    }
    if (activeCurrency === "NGN") {
      const rate = converted?.rate || 1500;
      return `₦${(Number(balances.usdt_balance) * rate).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return "$0.00";
  };

  return (
    <div className="inline-flex items-center bg-gray-950 rounded-xl border border-gray-800 p-1">
      {(["USD", "TCOIN", "NGN", "USDT"] as Currency[]).map((currency) => (
        <button
          key={currency}
          onClick={() => handleToggle(currency)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            activeCurrency === currency
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {currency}
        </button>
      ))}
      <span className="ml-3 text-sm font-bold text-white">{formatValue()}</span>
    </div>
  );
};
