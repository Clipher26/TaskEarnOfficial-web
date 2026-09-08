"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { streamsApi } from "@/api/streamsApi";
import { LiveStream, StreamReward } from "@/lib/types";
import { Radio, Play, Clock, Gift, Trophy, ExternalLink } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function StreamsPage() {
  const { setActiveModule, liveStreams, setLiveStreams } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState<string | null>(null);
  const [watchSeconds, setWatchSeconds] = useState<Record<string, number>>({});
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("streams");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await streamsApi.listStreams();
        setLiveStreams(res.streams);
      } catch (error) {
        console.error("Failed to fetch streams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setLiveStreams]);

  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(watchSeconds).forEach((streamId) => {
        setWatchSeconds((prev) => ({ ...prev, [streamId]: prev[streamId] + 1 }));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [watchSeconds]);

  const handleStartWatching = async (streamId: string) => {
    setWatching(streamId);
    try {
      await streamsApi.startWatching(streamId);
      setWatchSeconds((prev) => ({ ...prev, [streamId]: 0 }));
    } catch (error) {
      console.error("Failed to start watching:", error);
    } finally {
      setWatching(null);
    }
  };

  const handleRecordWatch = async (streamId: string) => {
    try {
      await streamsApi.recordWatch(streamId, watchSeconds[streamId] || 0);
      setWatchSeconds((prev) => ({ ...prev, [streamId]: 0 }));
    } catch (error) {
      console.error("Failed to record watch:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Watch & Earn</h1>
          <p className="text-[10px] text-slate-400">Watch live streams to earn passive TCoin drops</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {liveStreams.length === 0 ? (
          <div className="text-center py-12">
            <Radio size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No live streams right now</p>
            <p className="text-xs text-slate-500 mt-1">Check back later for live content!</p>
          </div>
        ) : (
          liveStreams.map((stream) => {
            const isWatching = !!watchSeconds[stream.id];
            const elapsed = watchSeconds[stream.id] || 0;
            const nextDrop = Math.max(0, (stream.drop_interval_minutes * 60) - elapsed);

            return (
              <div key={stream.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Play size={16} className="text-indigo-400" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{stream.title}</h3>
                      <p className="text-[10px] text-slate-400">{stream.streamer_name} • {stream.platform}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    LIVE
                  </span>
                </div>

                {stream.thumbnail_url && (
                  <div className="w-full h-32 bg-slate-800 rounded-xl mb-3 overflow-hidden">
                    <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Gift size={12} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Drop</p>
                    <p className="text-xs font-bold text-white">{stream.drop_amount_tcoin} TCN</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Clock size={12} className="text-indigo-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Interval</p>
                    <p className="text-xs font-bold text-white">{stream.drop_interval_minutes}m</p>
                  </div>
                  <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-center">
                    <Trophy size={12} className="text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Next Drop</p>
                    <p className="text-xs font-bold text-white">{isWatching ? `${nextDrop}s` : "--"}</p>
                  </div>
                </div>

                {isWatching ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <span className="text-xs text-indigo-400">Watching: {formatTime(elapsed)}</span>
                      <button
                        onClick={() => handleRecordWatch(stream.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-[10px] font-bold"
                      >
                        Claim Drop
                      </button>
                    </div>
                    <a
                      href={stream.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                    >
                      <ExternalLink size={14} />
                      Watch on {stream.platform}
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartWatching(stream.id)}
                    disabled={watching === stream.id}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {watching === stream.id ? "Starting..." : "Start Watching"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
