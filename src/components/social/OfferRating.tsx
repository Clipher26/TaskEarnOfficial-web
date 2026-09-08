"use client";

import React, { useState } from "react";
import { Star, StarOff } from "lucide-react";
import { socialApi } from "@/api/socialApi";

interface OfferRatingProps {
  offerId: string;
  ratings: { difficulty_rating: number; accuracy_rating: number; review_text?: string; username?: string; created_at: string }[];
  onSubmit?: () => void;
}

export const OfferRatingComponent: React.FC<OfferRatingProps> = ({ offerId, ratings, onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [accuracy, setAccuracy] = useState(3);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async () => {
    try {
      await socialApi.rateOffer({ offer_id: offerId, difficulty_rating: difficulty, accuracy_rating: accuracy, review_text: reviewText });
      setShowForm(false);
      setDifficulty(3);
      setAccuracy(3);
      setReviewText("");
      onSubmit?.();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  const avgDifficulty = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.difficulty_rating, 0) / ratings.length).toFixed(1) : "0.0";
  const avgAccuracy = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.accuracy_rating, 0) / ratings.length).toFixed(1) : "0.0";

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
    ));
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Offer Ratings</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20">
            Rate
          </button>
        )}
      </div>

      {ratings.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <p className="text-[10px] text-slate-400 mb-1">Difficulty</p>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(parseFloat(avgDifficulty)))}
              <span className="text-xs font-bold text-white ml-1">{avgDifficulty}</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <p className="text-[10px] text-slate-400 mb-1">Accuracy</p>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(parseFloat(avgAccuracy)))}
              <span className="text-xs font-bold text-white ml-1">{avgAccuracy}</span>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Difficulty Rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setDifficulty(i + 1)} className="transition-all">
                  <Star size={18} className={i < difficulty ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Accuracy Rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setAccuracy(i + 1)} className="transition-all">
                  <Star size={18} className={i < accuracy ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
            placeholder="Share your experience..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-400">
              Submit
            </button>
          </div>
        </div>
      )}

      {ratings.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {ratings.slice(0, 3).map((rating) => (
            <div key={`${rating.username}-${rating.created_at}`} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">{rating.username || "Anonymous"}</span>
                <div className="flex gap-1">
                  {renderStars(Math.round(rating.difficulty_rating))}
                </div>
              </div>
              {rating.review_text && <p className="text-[10px] text-slate-400">{rating.review_text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
