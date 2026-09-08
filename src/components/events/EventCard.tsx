"use client";

import Link from "next/link";
import { EventProgram } from "@/api/eventsApi";

interface EventCardProps {
  program: EventProgram;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  locked: { label: "LOCKED", color: "bg-gray-100 text-gray-800", icon: "🔒" },
  unlocked: { label: "UNLOCKED", color: "bg-blue-100 text-blue-800", icon: "🔓" },
  active: { label: "ACTIVE", color: "bg-green-100 text-green-800", icon: "⏳" },
  closed: { label: "CLOSED", color: "bg-red-100 text-red-800", icon: "🚫" },
};

export function EventCard({ program }: EventCardProps) {
  const statusConfig = STATUS_CONFIG[program.status] || STATUS_CONFIG.locked;
  const isLocked = program.status === "locked";
  const isClosed = program.status === "closed";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">
                {program.status === "active" && "⏳"}
                {program.status === "locked" && "🔒"}
                {program.status === "unlocked" && "🔓"}
                {program.status === "closed" && "🚫"}
              </span>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{program.title}</h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{program.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
          {program.event_date && (
            <span className="text-xs text-gray-500">
              📅 {new Date(program.event_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {isClosed && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center">
            <p className="text-sm text-gray-600">🚫 This program has ended</p>
            <p className="text-xs text-gray-500 mt-1">More programs coming soon!</p>
          </div>
        )}

        {isLocked && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800 font-medium">
              You need {program.min_referrals_required} referrals to unlock this program
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Invite friends and earn rewards together!
            </p>
          </div>
        )}

        {program.status === "active" && program.started_at && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-green-700 font-medium">⏳ Timer Running</p>
            <p className="text-xs text-green-600 mt-1">
              Started: {new Date(program.started_at).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>👥 {program.participation_count} participants</span>
          <span>💰 {program.total_rewards_distributed.toFixed(2)} distributed</span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/events/${program.slug}`}
            className={`block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
              isClosed
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={(e) => isClosed && e.preventDefault()}
          >
            {isClosed ? "View Results" : "View Program"}
          </Link>
        </div>
      </div>
    </div>
  );
}