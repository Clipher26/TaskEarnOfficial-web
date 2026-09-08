"use client";

import React, { useState, useRef } from "react";
import { MapPin, Upload, Loader2, Check } from "lucide-react";

interface GeoTaskUploaderProps {
  submissionId: string;
  onComplete: () => void;
}

export const GeoTaskUploader: React.FC<GeoTaskUploaderProps> = ({ submissionId, onComplete }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError("");
      },
      () => {
        setError("Unable to retrieve your location");
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitGeoTask = async () => {
    if (!location || !imagePreview) return;
    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      await fetch(`${API_BASE_URL}/api/tasks/geo/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
          latitude: location.lat,
          longitude: location.lng,
          image_url: imagePreview,
          address,
        }),
      });

      onComplete();
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">Take a photo at the specified location</p>
        <p className="text-[10px] text-slate-500">Your GPS coordinates will be verified automatically</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={requestLocation}
          className="w-full py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <MapPin size={14} />
          {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Get My Location"}
        </button>

        {location && (
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Store name or address"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          {imagePreview ? "Change Photo" : "Take / Upload Photo"}
        </button>

        {imagePreview && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

      <button
        onClick={submitGeoTask}
        disabled={isSubmitting || !location || !imagePreview}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Check size={14} />
            Submit Location Task
          </>
        )}
      </button>
    </div>
  );
};
