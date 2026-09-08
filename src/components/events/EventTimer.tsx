"use client";

import { useState, useEffect } from "react";

interface EventTimerProps {
  startedAt: string;
  duration: number;
  onExpire?: () => void;
  className?: string;
}

export function EventTimer({ startedAt, duration, onExpire, className = "" }: EventTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startedAt).getTime();
      const totalSeconds = duration * 3600;
      const elapsed = (now - start) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);

      if (remaining <= 0) {
        setIsExpired(true);
        onExpire?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = Math.floor(remaining % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, duration, onExpire]);

  const { hours, minutes, seconds } = timeLeft;

  let color = "text-green-500";
  const totalRemaining = hours * 3600 + minutes * 60 + seconds;
  if (totalRemaining < 3600) color = "text-red-500 animate-pulse";
  else if (totalRemaining < 21600) color = "text-yellow-500";
  else if (totalRemaining < 43200) color = "text-orange-500";

  if (isExpired) {
    return (
      <div className={`text-center p-6 bg-red-50 rounded-xl ${className}`}>
        <div className="text-6xl mb-2">⏰</div>
        <h3 className="text-xl font-bold text-red-600">Program Ended</h3>
        <p className="text-gray-600">This program is now closed. More programs coming soon!</p>
      </div>
    );
  }

  return (
    <div className={`text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl ${className}`}>
      <div className="text-sm text-gray-600 mb-2">⏳ Time Remaining</div>
      <div className={`font-mono text-4xl font-bold ${color}`}>
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {totalRemaining > 0 && totalRemaining < 3600 && "🔥 Hurry! Less than 1 hour left!"}
        {totalRemaining >= 3600 && totalRemaining < 21600 && "⚡ Less than 6 hours remaining!"}
        {totalRemaining >= 21600 && "🚀 Program is active!"}
      </div>
    </div>
  );
}