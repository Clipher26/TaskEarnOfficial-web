"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventProgram } from "@/api/eventsApi";

export default function UpcomingEventsPage() {
  const [programs, setPrograms] = useState<EventProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcoming = async () => {
      setLoading(true);
      try {
        const { getUpcomingEvents } = await import("@/api/eventsApi");
        setPrograms(await getUpcomingEvents());
      } catch (error) {
        console.error("Failed to load upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUpcoming();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎉 Upcoming Programs</h1>
          <p className="mt-2 text-gray-600">Get ready for these exciting events! Unlock programs with referrals.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading upcoming programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Upcoming Programs</h3>
            <p className="text-gray-600 mb-4">Check back soon for exciting events and rewards!</p>
            <Link href="/events" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              View All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {program.status === "unlocked" ? "🔓" : "🔒"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{program.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{program.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.status === "unlocked" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {program.status === "unlocked" ? "🔓 UNLOCKED" : "🔒 LOCKED"}
                    </span>
                    {program.event_date && (
                      <span className="text-xs text-gray-500">📅 {new Date(program.event_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Requires {program.min_referrals_required} referrals to participate
                  </p>
                  <Link
                    href={`/events/${program.slug}`}
                    className="block w-full text-center py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View Program
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}