"use client";

import React from "react";
import { GiftCardRedemption } from "@/api/fintechApi";
import { Gift, ExternalLink } from "lucide-react";

interface GiftCardGridProps {
  cards: GiftCardRedemption[];
}

const PROVIDER_STYLES: Record<string, string> = {
  AMAZON: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  GOOGLE_PLAY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  STEAM: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  APPLE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export const GiftCardGrid: React.FC<GiftCardGridProps> = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
        No gift cards redeemed yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {cards.map((card) => (
        <div key={card.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${PROVIDER_STYLES[card.provider] || PROVIDER_STYLES.AMAZON}`}>
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{card.provider}</p>
                <p className="text-[10px] text-gray-400">${card.amount_usdt} • {card.denomination}</p>
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-1 rounded-full font-semibold border ${
                card.status === "COMPLETED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : card.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {card.status}
            </span>
          </div>
          {card.delivery_url && (
            <a
              href={card.delivery_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Gift Card
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
