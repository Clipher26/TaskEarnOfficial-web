"use client";

import React, { useState, useEffect } from "react";
import { ShieldOff, Plus, X, UserX } from "lucide-react";
import { securityApi, BlacklistEntry } from "@/api/securityApi";

export function BlacklistManager() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [userId, setUserId] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [reason, setReason] = useState("");
  const [adding, setAdding] = useState(false);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await securityApi.getBlacklist();
      setEntries(data);
    } catch (err) {
      console.error("Failed to load blacklist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleAdd = async () => {
    if (!userId.trim() || !advertiserId.trim()) return;
    setAdding(true);
    try {
      await securityApi.addToBlacklist({
        user_id: userId,
        advertiser_id: advertiserId,
        reason: reason || undefined,
      });
      setUserId("");
      setAdvertiserId("");
      setReason("");
      setShowAdd(false);
      loadEntries();
    } catch (err) {
      console.error("Failed to add to blacklist:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    try {
      await securityApi.removeFromBlacklist(entryId);
      loadEntries();
    } catch (err) {
      console.error("Failed to remove from blacklist:", err);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldOff className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-white">Advertiser Blacklist</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition-all"
        >
          <Plus className="w-3 h-3" /> Add Entry
        </button>
      </div>

      {showAdd && (
        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-medium mb-1 block">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User UUID..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium mb-1 block">Advertiser ID</label>
              <input
                type="text"
                value={advertiserId}
                onChange={(e) => setAdvertiserId(e.target.value)}
                placeholder="Advertiser UUID..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-medium mb-1 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why blocking this advertiser..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add to Blacklist"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-500 text-xs">Loading blacklist...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-xs">No blacklist entries</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UserX className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-mono text-gray-300">{entry.user_id.slice(0, 8)}...</span>
                  <span className="text-[10px] text-gray-500">blocked from</span>
                  <span className="text-xs font-mono text-gray-300">{entry.advertiser_id.slice(0, 8)}...</span>
                </div>
                {entry.reason && <p className="text-[10px] text-gray-500">{entry.reason}</p>}
              </div>
              <button
                onClick={() => handleRemove(entry.id)}
                className="p-1.5 bg-gray-900 border border-gray-800 hover:border-red-500 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
