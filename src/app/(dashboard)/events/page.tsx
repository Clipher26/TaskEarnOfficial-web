"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/events/EventCard";
import { EventProgram } from "@/api/eventsApi";

type Tab = "all" | "active" | "upcoming" | "closed";

export default function EventsPage() {
  const [programs, setPrograms] = useState<EventProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const { getEvents, getActiveEvents, getUpcomingEvents, getClosedEvents } = await import("@/api/eventsApi");
        switch (activeTab) {
          case "active":
            setPrograms(await getActiveEvents());
            break;
          case "upcoming":
            setPrograms(await getUpcomingEvents());
            break;
          case "closed":
            setPrograms(await getClosedEvents());
            break;
          default:
            setPrograms(await getEvents());
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎉 Event Programs</h1>
          <p className="mt-2 text-gray-600">
            Join exclusive events, complete activities, and earn rewards. Unlock programs with referrals!
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {([
              { key: "all", label: "All Programs" },
              { key: "active", label: "Active" },
              { key: "upcoming", label: "Upcoming" },
              { key: "closed", label: "Closed" },
            ] as { key: Tab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Programs Found</h3>
            <p className="text-gray-600">Check back soon for exciting events and rewards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <EventCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}