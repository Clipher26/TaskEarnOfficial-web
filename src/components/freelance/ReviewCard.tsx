"use client";

import React from "react";
import { Star, ThumbsUp, ThumbsDown, Shield } from "lucide-react";
import { Review, ReviewType } from "@/types/freelance";

interface ReviewCardProps {
  review: Review;
  onView?: () => void;
}

const typeConfig: Record<ReviewType, { label: string; className: string }> = {
  [ReviewType.CLIENT_TO_FREELANCER]: { label: "Client Review", className: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  [ReviewType.FREELANCER_TO_CLIENT]: { label: "Freelancer Review", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export function ReviewCard({ review, onView }: ReviewCardProps) {
  const type = typeConfig[review.review_type] || typeConfig[ReviewType.CLIENT_TO_FREELANCER];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${type.className}`}>
              {type.label}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400">{review.rating}/5</span>
          </div>
          <p className="text-xs text-slate-300 mb-1">
            {review.from_user_name || `User ${review.from_user_id.slice(0, 8)}`} reviewed{" "}
            {review.to_user_name || `User ${review.to_user_id.slice(0, 8)}`}
          </p>
          {review.comment && (
            <p className="text-xs text-slate-400 line-clamp-3">"{review.comment}"</p>
          )}
          <p className="text-[10px] text-slate-500 mt-2">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onView}
          className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          View Details
        </button>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Shield size={10} className="text-slate-500" />
          {review.is_public ? "Public" : "Private"}
        </span>
      </div>
    </div>
  );
}
