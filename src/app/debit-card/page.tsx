"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fintechApi, DebitCardWaitlist } from "@/api/fintechApi";
import { CreditCard, CheckCircle2, Loader2, Crown } from "lucide-react";

const PERKS = [
  { tier: "BRONZE", label: "Bronze", fee: "$2/month", cashback: "1%" },
  { tier: "SILVER", label: "Silver", fee: "$1/month", cashback: "3%" },
  { tier: "GOLD", label: "Gold", fee: "Free", cashback: "5%" },
];

export default function DebitCardPage() {
  const { debitCardWaitlist, setDebitCardWaitlist } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    address_line1: "",
    city: "",
    country: "",
    phone: "",
    perks_tier: "SILVER",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const data = await fintechApi.getWaitlistEntry();
      setDebitCardWaitlist(data);
    } catch (err) {
      console.error("Failed to fetch waitlist", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.full_name) return;
    setSubmitting(true);
    try {
      const entry = await fintechApi.joinWaitlist({
        full_name: form.full_name,
        address_line1: form.address_line1 || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        phone: form.phone || undefined,
        perks_tier: form.perks_tier || undefined,
        notes: form.notes || undefined,
      });
      setDebitCardWaitlist(entry);
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to join waitlist");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    JOINED: { label: "Joined", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    APPROVED: { label: "Approved", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    ISSUED: { label: "Issued", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    REJECTED: { label: "Rejected", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">TaskEarn Debit Card</h1>
            <p className="text-xs text-slate-400">Spend your earnings anywhere</p>
          </div>
        </div>

        {!debitCardWaitlist ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PERKS.map((p) => (
                <div
                  key={p.tier}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    form.perks_tier === p.tier
                      ? "bg-indigo-500/10 border-indigo-500"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                  onClick={() => setForm({ ...form, perks_tier: p.tier })}
                >
                  <Crown className={`w-5 h-5 mx-auto mb-2 ${form.perks_tier === p.tier ? "text-indigo-400" : "text-gray-500"}`} />
                  <p className="text-xs font-bold text-white">{p.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{p.fee}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{p.cashback} cashback</p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Address Line 1</label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Notes (optional)</label>
                <textarea
                  placeholder="Any special requests..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none h-20"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Join Waitlist
              </button>
            </div>
          </>
        ) : success || debitCardWaitlist ? (
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">You are on the waitlist</p>
                <p className="text-xs text-gray-400">
                  Status: <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig[debitCardWaitlist.status]?.color || ""}`}>{debitCardWaitlist.status}</span>
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <p>Name: {debitCardWaitlist.full_name}</p>
              <p>City: {debitCardWaitlist.city}</p>
              <p>Country: {debitCardWaitlist.country}</p>
              {debitCardWaitlist.perks_tier && <p>Perks Tier: {debitCardWaitlist.perks_tier}</p>}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">Loading waitlist status...</div>
        )}
      </div>
    </div>
  );
}
