"use client";

import { useState } from "react";
import { EventProgram, TimerStatusResponse } from "@/api/eventsApi";

interface TimerControlsProps {
  eventId: string;
  status: string;
  timerData?: TimerStatusResponse;
}

export function TimerControls({ eventId, status, timerData }: TimerControlsProps) {
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendHours, setExtendHours] = useState(1);
  const [loading, setLoading] = useState(false);

  const unlock = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/events/${eventId}/unlock`, { method: "POST", headers: { "Content-Type": "application/json" } });
      window.location.reload();
    } catch (error) {
      console.error("Failed to unlock event:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/events/${eventId}/start`, { method: "POST", headers: { "Content-Type": "application/json" } });
      window.location.reload();
    } catch (error) {
      console.error("Failed to start timer:", error);
    } finally {
      setLoading(false);
    }
  };

  const extendTimer = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/events/${eventId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: extendHours }),
      });
      setShowExtendModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to extend timer:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeProgram = async () => {
    if (!confirm("Are you sure you want to close this program?")) return;
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/events/${eventId}/close`, { method: "POST", headers: { "Content-Type": "application/json" } });
      window.location.reload();
    } catch (error) {
      console.error("Failed to close event:", error);
    } finally {
      setLoading(false);
    }
  };

  const lockProgram = async () => {
    if (!confirm("Are you sure you want to lock this program?")) return;
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/events/${eventId}/lock`, { method: "POST", headers: { "Content-Type": "application/json" } });
      window.location.reload();
    } catch (error) {
      console.error("Failed to lock event:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "locked") {
    return (
      <button onClick={unlock} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
        🔓 Unlock Program
      </button>
    );
  }

  if (status === "unlocked") {
    return (
      <button onClick={startTimer} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50">
        ▶️ Start 24-Hour Timer
      </button>
    );
  }

  if (status === "active") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowExtendModal(true)} disabled={loading} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50">
            ⏰ Extend Timer
          </button>
          <button onClick={closeProgram} disabled={loading} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50">
            🚫 Close Program
          </button>
          <button onClick={lockProgram} disabled={loading} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50">
            🔒 Lock Program
          </button>
        </div>

        {timerData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">Timer Status</p>
            <p className="text-2xl font-mono font-bold text-blue-900">{timerData.formatted}</p>
            <p className="text-xs text-blue-600">Remaining</p>
          </div>
        )}

        {showExtendModal && (
          <div className="bg-white p-4 rounded-lg shadow-lg border">
            <h4 className="font-bold mb-2">Extend Timer</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="24"
                value={extendHours}
                onChange={(e) => setExtendHours(parseInt(e.target.value))}
                className="border rounded px-3 py-2 w-20"
              />
              <span>hours</span>
              <button onClick={extendTimer} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                Confirm Extension
              </button>
              <button onClick={() => setShowExtendModal(false)} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">🚫 Program Closed</p>
        <button onClick={unlock} disabled={loading} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
          🔄 Reopen Program
        </button>
      </div>
    );
  }

  return null;
}