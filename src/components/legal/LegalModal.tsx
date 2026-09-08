"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const ForcedLegalModal: React.FC<LegalModalProps> = ({ isOpen, onAccept, onClose }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasScrolledToBottom(false);
    setAcceptedTOS(false);
  }, [isOpen]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasScrolledToBottom(true);
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col max-h-[85vh] shadow-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">TaskEarn Legal Terms & Privacy</h3>
              <p className="text-[11px] text-gray-400">Please scroll through to read and accept the terms</p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto my-4 pr-3 space-y-4 text-xs text-gray-300 leading-relaxed font-sans bg-gray-950 p-4 rounded-xl border border-gray-800/80 min-h-0"
        >
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] flex items-center gap-2">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Scroll to the bottom of this document to enable acceptance.</span>
          </div>

          <h4 className="font-bold text-sm text-emerald-400">1. Single Account & Fraud Policy</h4>
          <p>
            Users are strictly prohibited from maintaining multiple accounts on TaskEarn. Any use of VPNs, 
            proxies, or automated script bots to complete tasks or simulate user activity will result in an 
            unannounced permanent account lock and forfeiture of all balances.
          </p>

          <h4 className="font-bold text-sm text-emerald-400">2. Task Submissions & Verification</h4>
          <p>
            All submitted task proofs (screenshots, links, codes) must be authentic. Fake or stolen proofs 
            will result in trust penalties and payout rejections. TaskEarn reserves final arbitration authority on 
            disputed advertiser campaigns.
          </p>

          <h4 className="font-bold text-sm text-emerald-400">3. Ledger Balances & Withdrawals</h4>
          <p>
            Earnings in TCoin or fiat balances can only be requested via supported withdrawal channels. 
            Verification checks apply to all manual deposit and payout requests.
          </p>

          <h4 className="font-bold text-sm text-emerald-400">4. Privacy & Anti-Spam</h4>
          <p>
            We process device identifiers and IP records solely to enforce single-account security and 
            verify transaction authenticity. We never sell your personal contact records to third parties.
          </p>
          
          <div ref={sentinelRef} className="pt-4 text-center text-[10px] text-gray-500 font-mono">
            --- End of Legal Terms ---
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled={!hasScrolledToBottom}
              checked={acceptedTOS}
              onChange={(e) => setAcceptedTOS(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-emerald-500 focus:ring-emerald-500 disabled:opacity-30"
            />
            <span className={`text-xs ${hasScrolledToBottom ? "text-gray-200" : "text-gray-500"}`}>
              I have read and agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!hasScrolledToBottom || !acceptedTOS}
              onClick={onAccept}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-4 h-4" />
              I Agree & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
