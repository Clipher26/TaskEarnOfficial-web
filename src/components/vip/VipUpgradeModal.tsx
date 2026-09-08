"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Copy, ExternalLink, Wallet, Landmark, Shield, Zap, Crown, Star, Gem, Award } from "lucide-react";

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentTier: string;
  currentBalance: number;
  onUpgradeSuccess?: (newTier: string, multiplier: number) => void;
}

interface TierConfig {
  name: string;
  price: number;
  multiplier: number;
  feeRate: number;
  color: string;
  icon: React.ElementType;
  benefits: string[];
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const TIERS: TierConfig[] = [
  {
    name: "FREE",
    price: 0,
    multiplier: 1.0,
    feeRate: 0.001,
    color: "slate",
    icon: Shield,
    benefits: ["Basic Access"],
  },
  {
    name: "BRONZE",
    price: 4,
    multiplier: 1.0,
    feeRate: 0.001,
    color: "orange",
    icon: Shield,
    benefits: ["Basic Access"],
  },
  {
    name: "SILVER",
    price: 9.99,
    multiplier: 1.1,
    feeRate: 0.0008,
    color: "gray",
    icon: Star,
    benefits: ["0.08% Trade Fees", "5% Task Bonus", "Priority Support", "Earnflip Access"],
  },
  {
    name: "GOLD",
    price: 19.99,
    multiplier: 1.25,
    feeRate: 0.0005,
    color: "amber",
    icon: Crown,
    benefits: ["0.05% Trade Fees", "10% Task Bonus", "Premium Earnpoly Rooms", "Priority Support", "Earnclash Basic Rooms"],
  },
  {
    name: "PLATINUM",
    price: 29.99,
    multiplier: 1.5,
    feeRate: 0.0003,
    color: "cyan",
    icon: Gem,
    benefits: ["0.03% Trade Fees", "15% Task Bonus", "Exclusive Tournaments", "Dedicated Manager", "Earnclash Premium Rooms"],
  },
  {
    name: "DIAMOND",
    price: 49.99,
    multiplier: 2.0,
    feeRate: 0.0001,
    color: "blue",
    icon: Zap,
    benefits: ["0.01% Trade Fees", "20% Task Bonus", "Enterprise Analytics", "24/7 Support", "White-label Trading"],
  },
  {
    name: "ELITE_TRADER",
    price: 99.99,
    multiplier: 2.5,
    feeRate: 0,
    color: "amber",
    icon: Award,
    benefits: ["Zero Platform Fee", "Unlimited Everything", "White-glove Support", "Executive Manager", "Revenue Sharing"],
  },
];

const PAYMENT_METHODS = [
  { id: "WALLET_BALANCE", label: "Internal Balance", icon: Wallet, description: "Pay directly from your USDT wallet" },
  { id: "EXTERNAL_CRYPTO", label: "External Crypto", icon: ExternalLink, description: "USDT Web3 / Direct Deposit" },
  { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark, description: "Direct bank transfer" },
];

const EXTERNAL_ADDRESSES = [
  { network: "BSC-BEP20 USDC", address: "0x08f424021e950134726e3b3ee628325fdbc4183b" },
  { network: "TRON-TRX20 USDT", address: "TKyS24mVA5cGrHgA2CsWufT3hY36yJLsrW" },
  { network: "BTC USDT", address: "16W2fj5bejz8BWyEtjauyjJQiVQp9j8JBM" },
];

const BANK_ACCOUNTS = [
  { bank: "Palmpay", account: "7079646853", name: "Olusiku Oluwabukola Oluwanifemi" },
  { bank: "Moniepoint", account: "6692031257", name: "Oluwabukola Olusiku" },
  { bank: "Palmpay", account: "899 1574 608", name: "Oluwabukola Olusiku" },
];

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentTier,
  currentBalance,
  onUpgradeSuccess,
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("WALLET_BALANCE");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"select" | "payment" | "confirm" | "success">("select");
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const currentTierIndex = TIERS.findIndex((t) => t.name === currentTier);
  const availableTiers = TIERS.slice(currentTierIndex + 1);

  const selectedTierConfig = TIERS.find((t) => t.name === selectedTier);
  const currentTierPrice = TIERS[currentTierIndex]?.price || 0;
  const upgradeFee = selectedTierConfig ? selectedTierConfig.price - currentTierPrice : 0;

  const canAfford = currentBalance >= upgradeFee;

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setSelectedTier(null);
      setPaymentMethod("WALLET_BALANCE");
      setIsLoading(false);
      setShowConfetti(false);
      setCopiedAddress(null);
    }
  }, [isOpen]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedTier || !userId) return;
    setIsLoading(true);

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/vip/upgrade?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_tier: selectedTier,
          payment_method: paymentMethod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Upgrade failed");
      }

      const result = await response.json();
      setStep("success");
      setShowConfetti(true);
      onUpgradeSuccess?.(result.new_vip_tier, result.task_multiplier);

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upgrade failed");
      setStep("payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="text-amber-500" size={20} />
            VIP Tier Upgrade
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {step === "select" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Select Target Tier</p>
              {availableTiers.map((tier) => {
                const Icon = tier.icon;
                const priceDiff = tier.price - currentTierPrice;
                return (
                  <button
                    key={tier.name}
                    onClick={() => {
                      setSelectedTier(tier.name);
                      setStep("payment");
                    }}
                    className="w-full p-4 rounded-xl border border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${tier.color}-500/10 border border-${tier.color}-500/20`}>
                          <Icon size={20} className={`text-${tier.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                          <p className="text-[10px] text-gray-400">Multiplier: {tier.multiplier}x</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">${priceDiff}</p>
                        <p className="text-[10px] text-gray-500">upgrade</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tier.benefits.slice(0, 2).map((benefit) => (
                        <span key={benefit} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/50">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === "payment" && selectedTierConfig && (
            <div className="space-y-4">
              <button
                onClick={() => setStep("select")}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ← Back to tier selection
              </button>

              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Upgrade to</span>
                  <span className="text-sm font-bold text-white">{selectedTierConfig.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">Upgrade Fee</span>
                  <span className="text-lg font-extrabold text-emerald-400">${upgradeFee} USDT</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payment Method</p>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        paymentMethod === method.id
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-gray-700 bg-gray-800/40 hover:border-gray-600"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${paymentMethod === method.id ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700/50 text-gray-400"}`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-bold ${paymentMethod === method.id ? "text-emerald-400" : "text-white"}`}>{method.label}</p>
                        <p className="text-[10px] text-gray-500">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && <Check size={16} className="text-emerald-500 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "EXTERNAL_CRYPTO" && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Send USDT to</p>
                  {EXTERNAL_ADDRESSES.map((item) => (
                    <div key={item.network} className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-[10px] text-gray-500 mb-1">{item.network}</p>
                      <p className="text-xs text-gray-300 font-mono break-all">{item.address}</p>
                      <button
                        onClick={() => handleCopyAddress(item.address)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Copy size={12} />
                        {copiedAddress === item.address ? "Copied!" : "Copy Address"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {paymentMethod === "BANK_TRANSFER" && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Transfer to</p>
                  {BANK_ACCOUNTS.map((account) => (
                    <div key={account.account} className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-xs text-white font-semibold">{account.bank}</p>
                      <p className="text-xs text-gray-400">{account.account}</p>
                      <p className="text-[10px] text-gray-500">{account.name}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep("confirm")}
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                Continue
              </button>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <button
                onClick={() => setStep("payment")}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ← Back
              </button>

              <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Tier</span>
                  <span className="text-sm font-bold text-white">{selectedTierConfig?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Amount</span>
                  <span className="text-lg font-extrabold text-emerald-400">${upgradeFee} USDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Payment</span>
                  <span className="text-xs text-gray-300">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</span>
                </div>
                {paymentMethod === "WALLET_BALANCE" && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Your Balance</span>
                    <span className={`text-xs font-bold ${canAfford ? "text-emerald-400" : "text-rose-400"}`}>
                      ${currentBalance.toFixed(2)} USDT
                    </span>
                  </div>
                )}
              </div>

              {!canAfford && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <p className="text-xs text-rose-400 font-medium">insufficient funds please fund your wallet now to continue</p>
                </div>
              )}

              <button
                onClick={handleUpgrade}
                disabled={isLoading || !canAfford}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Upgrading Tier...
                  </>
                ) : (
                  <>Confirm Upgrade</>
                )}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Check size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Upgrade Complete!</h3>
              <p className="text-xs text-gray-400">Your account has been upgraded to {selectedTierConfig?.name}</p>
              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                  <Zap size={14} className="text-amber-500" />
                  Multiplier: {selectedTierConfig?.multiplier}x
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                  <Shield size={14} className="text-cyan-500" />
                  Fee Rate: {selectedTierConfig?.feeRate}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};