"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/context/AuthContext";
import { useKYC } from "@/hooks/useKYC";
import { walletApi } from "@/api/walletApi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "OVERVIEW" | "DEPOSIT" | "WITHDRAW";
type DepositMethod = "CRYPTO" | "PAYSTACK";
type CryptoNetwork = "TRON" | "BSC" | "BTC";
type WithdrawMethod = "CRYPTO" | "BANK" | "GIFT_CARD";

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const {
    balances,
    isLoading,
    isError,
    initializePaystackDeposit,
    isInitializingPaystack,
    submitWithdrawal,
    isSubmittingWithdraw,
  } = useWallet();
  const { user } = useAuth();
  const { status: kycStatus, loading: kycLoading, startVerification } = useKYC();
  const isKycVerified = kycStatus?.kyc_status === "VERIFIED";

  const [activeTab, setActiveTab] = useState<TabType>("OVERVIEW");
  const [depositMethod, setDepositMethod] = useState<DepositMethod>("CRYPTO");
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>("TRON");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState<string>("");
  const [selectedBankNumber, setSelectedBankNumber] = useState<string>("7079646853");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>("CRYPTO");
  const [selectedGiftCard, setSelectedGiftCard] = useState<string>("");
  const [giftCardDenomination, setGiftCardDenomination] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [bitrefillProducts, setBitrefillProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lockedWithdrawalMethod, setLockedWithdrawalMethod] = useState<string | null>(null);
  const [isMethodLocked, setIsMethodLocked] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [exchangeRates, setExchangeRates] = useState<{ deposit: number; withdrawal: number } | null>(null);
  const [paystackPublicKey, setPaystackPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (!balances && !isLoading && !isError) {
      setActiveTab("DEPOSIT");
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchWithdrawalMethod = async () => {
      try {
        const data = await walletApi.getWithdrawalMethod();
        setLockedWithdrawalMethod(data.locked_withdrawal_method);
        setIsMethodLocked(data.withdrawal_method_locked);
        if (data.withdrawal_method_locked && data.locked_withdrawal_method) {
          const locked = data.locked_withdrawal_method.upper();
          if (locked === "CRYPTO_EXTERNAL" || locked === "CRYPTO") {
            setWithdrawMethod("CRYPTO");
          } else if (locked === "BANK_TRANSFER" || locked === "BANK") {
            setWithdrawMethod("BANK");
          } else if (locked === "GIFT_CARD") {
            setWithdrawMethod("GIFT_CARD");
          }
        }
      } catch (error) {
        // ignore
      }
    };

    const fetchExchangeRates = async () => {
      try {
        const data = await walletApi.getExchangeRates();
        setExchangeRates({
          deposit: data.deposit_rate || data.usdt_to_ngn_deposit,
          withdrawal: data.withdrawal_rate || data.usdt_to_ngn_withdrawal,
        });
      } catch (error) {
        // ignore
      }
    };

    const fetchDepositOptions = async () => {
      try {
        const data = await walletApi.getDepositOptions();
        setPaystackPublicKey(data.paystack_public_key || null);
      } catch (error) {
        // ignore
      }
    };

    fetchWithdrawalMethod();
    fetchExchangeRates();
    fetchDepositOptions();
  }, []);

  const CRYPTO_ADDRESSES = {
    BSC: {
      network: "BSC (BEP20)",
      token: "USDC / USDT",
      address: "0x08f424021e950134726e3b3ee628325fdbc4183b",
    },
    TRON: {
      network: "TRON (TRC20)",
      token: "USDT",
      address: "TKyS24mVA5cGrHgA2CsWufT3hY36yJLsrW",
    },
    BTC: {
      network: "BTC Network",
      token: "BTC / USDT",
      address: "16W2fj5bejz8BWyEtjauyjJQiVQp9j8JBM",
    },
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePaystackDeposit = async () => {
    if (!depositAmount) return;
    try {
      const res = await initializePaystackDeposit({
        amount_ngn: parseFloat(depositAmount),
        email: user?.email || undefined,
      });
      const redirectUrl = `${res.authorization_url}`;
      window.location.href = redirectUrl;
    } catch (err: any) {
      setStatusMessage(err.response?.data?.detail || "Failed to initialize Paystack payment.");
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount) return;
    try {
      if (withdrawMethod === "GIFT_CARD") {
        if (!selectedGiftCard || !giftCardDenomination || !recipientEmail) return;
        await submitWithdrawal({
          amount: parseFloat(withdrawAmount),
          currency: "USDT",
          method: "GIFT_CARD",
          gift_card_provider: selectedGiftCard as any,
          gift_card_denomination: giftCardDenomination,
          recipient_email: recipientEmail,
        });
        setStatusMessage("Gift card withdrawal request submitted!");
        setWithdrawAmount("");
        setSelectedGiftCard("");
        setGiftCardDenomination("");
        setRecipientEmail("");
      } else if (withdrawMethod === "BANK") {
        if (!bankName || !accountName || !withdrawAddress) return;
        await submitWithdrawal({
          amount: parseFloat(withdrawAmount),
          currency: "NGN",
          method: "BANK_TRANSFER",
          bank_name: bankName,
          account_number: withdrawAddress,
          account_name: accountName,
        });
        setStatusMessage("Bank withdrawal request submitted!");
        setWithdrawAmount("");
        setWithdrawAddress("");
        setBankName("");
        setAccountName("");
      } else {
        if (!withdrawAddress) return;
        await submitWithdrawal({
          amount: parseFloat(withdrawAmount),
          currency: "USDT",
          method: "CRYPTO_EXTERNAL",
          crypto_network: "TRON-TRC20",
          destination_crypto_address: withdrawAddress,
        });
        setStatusMessage("Crypto withdrawal request submitted!");
        setWithdrawAmount("");
        setWithdrawAddress("");
      }
    } catch (err: any) {
      setStatusMessage(err.response?.data?.detail || "Withdrawal failed.");
    }
  };

  useEffect(() => {
    if (withdrawMethod === "GIFT_CARD" && bitrefillProducts.length === 0) {
      setLoadingProducts(true);
      walletApi.getBitrefillProducts()
        .then((data) => setBitrefillProducts(data.products || []))
        .catch(() => setBitrefillProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [withdrawMethod]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800/80 bg-gray-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Virtual Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="mx-5 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex justify-between items-center">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isError && (
          <div className="mx-5 mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex justify-between items-center">
            <span>Failed to load wallet balances. You can still deposit or withdraw.</span>
            <button onClick={() => setActiveTab("DEPOSIT")}>
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex p-1.5 m-5 bg-gray-950 rounded-2xl border border-gray-800">
          {(["OVERVIEW", "DEPOSIT", "WITHDRAW"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Body Area */}
        <div className="px-5 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <span className="text-xs">Fetching balances from server...</span>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === "OVERVIEW" && balances && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/60 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <span className="text-xs font-medium text-gray-400">Total USDT Balance</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-white">
                        ${balances.usdt_balance.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">USDT</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                      <span>P2P Escrow Locked:</span>
                      <span className="font-semibold text-amber-400">
                        ${balances.escrow_balance.toFixed(2)} USDT
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[10px] text-gray-400">Tcoin Balance</span>
                      <p className="mt-1 text-base font-bold text-white">
                        {balances.tcoin_balance.toLocaleString()} TC
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ≈ ${balances.tcoin_usd_value.toFixed(2)} USD
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
                      <span className="text-[10px] text-gray-400">Fiat (NGN) Balance</span>
                      <p className="mt-1 text-base font-bold text-white">
                        ₦{balances.ngn_balance.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-400">Fiat Vault Active</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("DEPOSIT")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
                    >
                      <ArrowDownLeft className="w-4 h-4" /> Deposit
                    </button>
                    <button
                      onClick={() => setActiveTab("WITHDRAW")}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Withdraw
                    </button>
                  </div>
                </div>
              )}

              {/* DEPOSIT TAB */}
              {activeTab === "DEPOSIT" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800 text-xs">
                    <button
                      onClick={() => setDepositMethod("CRYPTO")}
                      className={`py-2 rounded-lg font-medium transition-all ${
                        depositMethod === "CRYPTO"
                          ? "bg-gray-800 text-emerald-400 border border-emerald-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      External Crypto
                    </button>
                    <button
                      onClick={() => setDepositMethod("PAYSTACK")}
                      className={`py-2 rounded-lg font-medium transition-all ${
                        depositMethod === "PAYSTACK"
                          ? "bg-gray-800 text-emerald-400 border border-emerald-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Paystack (NGN)
                    </button>
                  </div>

                   {depositMethod === "CRYPTO" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-300">
                          Select Crypto Network:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(CRYPTO_ADDRESSES).map(([network, data]) => (
                            <button
                              key={network}
                              onClick={() => setSelectedNetwork(network as CryptoNetwork)}
                              className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedNetwork === network
                                  ? "bg-gray-800 text-emerald-400 border border-emerald-500/30"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              {network}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-semibold text-gray-300">
                          {CRYPTO_ADDRESSES[selectedNetwork].network} {CRYPTO_ADDRESSES[selectedNetwork].token}
                          Address:
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={CRYPTO_ADDRESSES[selectedNetwork].address}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-l-xl text-[10px] text-gray-300 font-mono focus:outline-none"
                          />
                          <button
                            onClick={() => handleCopy(CRYPTO_ADDRESSES[selectedNetwork].address, CRYPTO_ADDRESSES[selectedNetwork].address)}
                            className="px-2 bg-gray-800 border border-l-0 border-gray-800 rounded-r-xl text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedKey === CRYPTO_ADDRESSES[selectedNetwork].address ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Send {CRYPTO_ADDRESSES[selectedNetwork].token} to this address.
                          Only deposits on the specified network will be credited.
                        </p>
                      </div>
                    </div>
                  )}

                  {depositMethod === "PAYSTACK" && (
                    <div className="space-y-3">
                      {paystackPublicKey ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300">
                              Amount to Deposit (NGN):
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 10000"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                            />
                            {depositAmount && parseFloat(depositAmount) > 0 && (
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                                <div className="flex justify-between text-[10px] text-amber-300">
                                  <span>15% Transaction Fee:</span>
                                  <span className="font-mono">
                                    ₦{(parseFloat(depositAmount) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-white font-bold">
                                  <span>Total Required:</span>
                                  <span className="font-mono">
                                    ₦{(parseFloat(depositAmount) * 1.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                {exchangeRates && (
                                  <div className="flex justify-between text-[10px] text-emerald-300">
                                    <span>You will receive (USDT):</span>
                                    <span className="font-mono">
                                      ${(parseFloat(depositAmount) / exchangeRates.deposit).toFixed(4)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handlePaystackDeposit}
                            disabled={isInitializingPaystack || !depositAmount || parseFloat(depositAmount) <= 0}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isInitializingPaystack ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <img src="/icons/paystack-icon.svg" alt="Paystack" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            )}
                            Pay with Paystack
                          </button>

                          {statusMessage && (
                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <p className="text-[10px] text-red-300">{statusMessage}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-gray-500">
                            Paystack is not configured. Please contact support.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* WITHDRAW TAB */}
              {activeTab === "WITHDRAW" && balances && (
                <div className="space-y-3">
                  {kycLoading ? (
                    <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
                      <p className="text-[10px] text-gray-400">Checking KYC status...</p>
                    </div>
                  ) : !isKycVerified ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-amber-300">KYC Required to Withdraw</p>
                      <p className="text-[10px] text-gray-400">
                        {kycStatus?.kyc_status === "REJECTED"
                          ? `Your previous KYC was rejected${kycStatus.rejection_reason ? `: ${kycStatus.rejection_reason}` : ""}. Please retry below.`
                          : "To comply with regulations, complete identity verification (Didit) before withdrawing funds."}
                      </p>
                      <button
                        onClick={async () => {
                          const session = await startVerification();
                          if (session?.session_url) window.open(session.session_url, "_blank");
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
                      >
                        {kycStatus?.kyc_status === "REJECTED" ? "Retry KYC Verification" : "Start KYC Verification"}
                      </button>
                    </div>
                  ) : null}

                  {isKycVerified && isMethodLocked && lockedWithdrawalMethod && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-[10px] text-amber-300 font-bold">
                        WITHDRAWAL METHOD LOCKED: {lockedWithdrawalMethod.replace("_", " ")}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Contact support to change your withdrawal method.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-300">
                      Withdrawal Method:
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {(["CRYPTO", "BANK", "GIFT_CARD"] as WithdrawMethod[]).map((method) => {
                        const isLocked = isMethodLocked && !!lockedWithdrawalMethod && (
                          (method === "CRYPTO" && (lockedWithdrawalMethod === "CRYPTO_EXTERNAL" || lockedWithdrawalMethod === "CRYPTO")) ||
                          (method === "BANK" && lockedWithdrawalMethod === "BANK_TRANSFER") ||
                          (method === "GIFT_CARD" && lockedWithdrawalMethod === "GIFT_CARD")
                        );
                        const isSelected = isLocked || withdrawMethod === method;
                        return (
                          <button
                            key={method}
                            onClick={() => !isLocked && setWithdrawMethod(method)}
                            disabled={isLocked}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-gray-950 border-gray-800 text-gray-400"
                            } ${isLocked ? "opacity-70 cursor-not-allowed" : "hover:border-gray-700"}`}
                          >
                            {method === "GIFT_CARD" ? "Gift Card" : method}
                            {isLocked && " (Locked)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {exchangeRates && (
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <p className="text-[10px] text-indigo-300 font-bold">
                        EXCHANGE RATES
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Deposit: 1 USDT = ₦{exchangeRates.deposit.toLocaleString()} NGN
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Withdrawal: 1 USDT = ₦{exchangeRates.withdrawal.toLocaleString()} NGN
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-300">
                      Withdrawal Amount:
                    </label>
                    <input
                      type="number"
                      placeholder="Min: 10"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                      <span>Available: ${balances.usdt_balance.toFixed(2)} USDT / ₦{balances.ngn_balance.toLocaleString()}</span>
                      <button
                        onClick={() => setWithdrawAmount(balances.usdt_balance.toString())}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        MAX
                      </button>
                    </div>
                    {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                        <div className="flex justify-between text-[10px] text-amber-300">
                          <span>10% Withdrawal Fee:</span>
                          <span className="font-mono">{(parseFloat(withdrawAmount) * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2 })} {withdrawMethod === "BANK" ? "NGN" : "USDT"}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-white font-bold">
                          <span>You Receive:</span>
                          <span className="font-mono">{(parseFloat(withdrawAmount) * 0.90).toLocaleString(undefined, { minimumFractionDigits: 2 })} {withdrawMethod === "BANK" ? "NGN" : "USDT"}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Fee is deducted automatically. Total deduction: {(parseFloat(withdrawAmount) * 1.10).toLocaleString(undefined, { minimumFractionDigits: 2 })} {withdrawMethod === "BANK" ? "NGN" : "USDT"}</p>
                      </div>
                    )}
                  </div>

                  {withdrawMethod === "CRYPTO" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-[10px] text-amber-300 font-bold">
                          ONLY TRON USDT (TRC20) WITHDRAWALS SUPPORTED
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Send only USDT on the TRON (TRC20) network. Other networks are not supported and may result in permanent loss of funds.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300">
                          TRON USDT Address:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your TRON (TRC20) USDT address"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        {withdrawAddress && withdrawAddress.length < 20 && (
                          <p className="text-[10px] text-rose-400 mt-1">Invalid address format</p>
                        )}
                      </div>
                    </div>
                  )}

                  {withdrawMethod === "BANK" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-300">
                          Bank Name:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Palmpay, Moniepoint MFB"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300">
                          Account Number:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter bank account number"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        {withdrawAddress && withdrawAddress.length < 10 && (
                          <p className="text-[10px] text-rose-400 mt-1">Invalid account number format</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300">
                          Account Name:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter account holder name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                        {accountName && accountName.trim().length < 3 && (
                          <p className="text-[10px] text-rose-400 mt-1">Invalid account name format</p>
                        )}
                      </div>

                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-[10px] text-rose-300 font-bold">
                          WARNING: FUNDS LOSS RISK
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Any mismatch in bank name, account number, or account name will result in permanent loss of funds. Please verify all details carefully before submitting.
                        </p>
                      </div>
                    </div>
                  )}

                  {withdrawMethod === "GIFT_CARD" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-300">Select Brand:</label>
                        <select
                          value={selectedGiftCard}
                          onChange={(e) => setSelectedGiftCard(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">Select a brand</option>
                          {["AMAZON", "GOOGLE_PLAY", "STEAM", "APPLE", "BITREFILL"].map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300">Denomination:</label>
                        <select
                          value={giftCardDenomination}
                          onChange={(e) => setGiftCardDenomination(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">Select denomination</option>
                          <option value="10 USD">10 USD</option>
                          <option value="25 USD">25 USD</option>
                          <option value="50 USD">50 USD</option>
                          <option value="100 USD">100 USD</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-300">Recipient Email:</label>
                        <input
                          type="email"
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {selectedGiftCard === "BITREFILL" && (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <p className="text-[10px] text-indigo-300">
                            Bitrefill gift cards are delivered instantly to the recipient email. Please verify the email address before submitting.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                      {withdrawMethod === "GIFT_CARD"
                        ? "Gift card orders require admin approval first. Once approved, Bitrefill processes and delivers the card to the recipient email. Delivery typically takes 1-48 hours after approval."
                        : withdrawMethod === "BANK"
                        ? "Bank withdrawals require exact matching details. Any mismatch will cause permanent loss of funds. Processing time: 1-48 hours after admin approval."
                        : "Only TRON USDT (TRC20) withdrawals are supported. Sending other assets to this address will result in permanent loss. Processing time: 1-48 hours after admin approval."}
                    </span>
                  </div>

                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={
                      isSubmittingWithdraw ||
                      !withdrawAmount ||
                      (withdrawMethod === "GIFT_CARD" ? (!selectedGiftCard || !giftCardDenomination || !recipientEmail) : withdrawMethod === "BANK" ? (!bankName || !accountName || !withdrawAddress) : !withdrawAddress)
                    }
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingWithdraw ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Withdrawal"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
