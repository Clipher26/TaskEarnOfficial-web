"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventProgram, ParticipationResponse, SubmissionResponse, TimerStatusResponse } from "@/api/eventsApi";
import { EventTimer } from "@/components/events/EventTimer";

export default function ParticipatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [program, setProgram] = useState<EventProgram | null>(null);
  const [participation, setParticipation] = useState<ParticipationResponse | null>(null);
  const [timer, setTimer] = useState<TimerStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { getEventDetail, getEventTimer, getEventRewards, getEventLeaderboard } = await import("@/api/eventsApi");
      const detail = await getEventDetail(slug);
      setProgram(detail.program);
      const timerData = await getEventTimer(slug);
      setTimer(timerData);
    } catch (error) {
      console.error("Failed to load participate page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  const handleSubmit = async () => {
    if (!selectedActivity) return;
    setSubmitting(true);
    try {
      const { submitActivity } = await import("@/api/eventsApi");
      const result = await submitActivity({
        event_id: program!.id,
        activity_id: selectedActivity,
        submission_data: submissionData || "Submitted",
      });
      alert("Activity submitted successfully!");
      setSelectedActivity(null);
      setSubmissionData("");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to submit activity");
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = program?.status === "locked";
  const isActive = program?.status === "active";
  const isClosed = program?.status === "closed";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Not Found</h2>
          <button onClick={() => router.push("/events")} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button onClick={() => router.push(`/events/${slug}`)} className="text-blue-600 hover:text-blue-700 mb-2">
            ← Back to Program
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{program.title} - Participate</h1>
        </div>

        {isActive && timer && (
          <div className="mb-6">
            <EventTimer startedAt={timer.started_at!} duration={timer.duration_hours} />
          </div>
        )}

        {isClosed && (
          <div className="mb-6">
            <div className="text-center py-12 bg-red-50 rounded-2xl">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Has Ended</h2>
              <p className="text-gray-600 mb-4">This program is now closed. More programs coming soon!</p>
              <button onClick={() => router.push("/events")} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                View Other Events
              </button>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="text-center py-12 bg-yellow-50 rounded-2xl">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Locked</h2>
            <p className="text-gray-600 mb-4">You need {program.min_referrals_required} referrals to participate.</p>
            <button onClick={() => router.push("/referral")} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Get Referrals
            </button>
          </div>
        )}

        {isActive && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Complete Activities</h2>
              <div className="space-y-3">
                {program.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedActivity === activity.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedActivity(activity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">${activity.reward_amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{activity.xp_reward} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedActivity && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Activity</h3>
                <textarea
                  value={submissionData}
                  onChange={(e) => setSubmissionData(e.target.value)}
                  placeholder="Enter your submission details..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Activity"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}