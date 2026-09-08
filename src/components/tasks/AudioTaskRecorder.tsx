"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Upload, Loader2 } from "lucide-react";

interface AudioTaskRecorderProps {
  submissionId: string;
  onComplete: () => void;
}

export const AudioTaskRecorder: React.FC<AudioTaskRecorderProps> = ({ submissionId, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= 10) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const submitAudio = async () => {
    if (!audioUrl) return;
    setIsUploading(true);

    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      await fetch(`${API_BASE_URL}/api/tasks/audio/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submission_id: submissionId,
          audio_url: audioUrl,
          duration_seconds: duration,
        }),
      });

      onComplete();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-2">Record a 10-second voice clip for AI training</p>
        <div className="flex items-center justify-center gap-1 text-amber-400">
          <span className="text-lg font-bold">{duration}s</span>
          <span className="text-xs text-slate-500">/ 10s</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!!audioUrl}
            className="p-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-full transition-all disabled:opacity-50"
          >
            <Mic size={24} className="text-rose-400" />
          </button>
        ) : (
          <button onClick={stopRecording} className="p-4 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 rounded-full transition-all">
            <Square size={24} className="text-slate-300" />
          </button>
        )}

        {audioUrl && (
          <div className="flex items-center gap-2">
            <audio src={audioUrl} controls className="h-10" />
          </div>
        )}
      </div>

      {audioUrl && (
        <button
          onClick={submitAudio}
          disabled={isUploading}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={14} />
              Submit Recording
            </>
          )}
        </button>
      )}
    </div>
  );
};
