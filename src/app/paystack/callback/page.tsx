"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { walletApi } from "@/api/walletApi";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaystackCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const reference = searchParams?.get("reference");

    if (!reference) {
      setStatus("error");
      setMessage("No reference found in the callback.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await walletApi.verifyPaystackDeposit(reference);
        if (res.status === "COMPLETED") {
          setStatus("success");
          setMessage(
            res.instructions ||
              `Payment verified successfully! ${res.net_amount?.toFixed(4)} USDT has been credited to your wallet.`
          );
        } else if (res.status === "PENDING") {
          setStatus("loading");
          setMessage("Payment is being verified...");
        } else {
          setStatus("error");
          setMessage(res.instructions || "Payment verification failed.");
        }
      } catch (err: any) {
        setStatus("error");
        const detail = err.response?.data?.detail || err.message || "Failed to verify payment.";
        setMessage(detail);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Verifying Payment</h3>
            <p className="text-xs text-slate-400">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-xs text-slate-300 mb-4">{message}</p>
            <button
              onClick={handleBackToDashboard}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Payment Verification Failed</h3>
            <p className="text-xs text-slate-300 mb-4">{message}</p>
            <button
              onClick={handleBackToDashboard}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
