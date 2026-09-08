"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventProgram, TimerStatusResponse } from "@/api/eventsApi";
import { EventTimer } from "@/components/events/EventTimer";
import { ClosedProgramMessage } from "@/components/events/ClosedProgramMessage";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [program, setProgram] = useState<EventProgram | null>(null);
  const [timer, setTimer] = useState<TimerStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [referralCount, setReferralCount] = useState<number | null>(null);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const { getEventDetail, getEventTimer, getReferralStatus, participateInEvent } = await import("@/api/eventsApi");
      const detail = await getEventDetail(slug);
      setProgram(detail.program);
      const timerData = await getEventTimer(slug);
      setTimer(timerData);
      try {
        const referral = await getReferralStatus();
        setReferralCount(referral.referrals_count);
      } catch {
        setReferralCount(null);
      }
    } catch (error) {
      console.error("Failed to load event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const handleParticipate = async () => {
    setParticipating(true);
    try {
      await participateInEvent(slug);
      alert("Successfully registered for this event!");
      router.push(`/events/${slug}/participate`);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to participate");
    } finally {
      setParticipating(false);
    }
  };

  const isLocked = program?.status === "locked";
  const isActive = program?.status === "active";
  const isClosed = program?.status === "closed";
  const hasEnoughReferrals = referralCount !== null && referralCount >= (program?.min_referrals_required || 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading program...</p>
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
          <p className="text-gray-600 mb-4">The event program you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => router.push("/events")} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">
                    {isActive && "⏳"}
                    {isLocked && "🔒"}
                    {program.status === "unlocked" && "🔓"}
                    {isClosed && "🚫"}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{program.title}</h1>
                </div>
                <p className="text-gray-600 mt-2">{program.description}</p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isActive ? "bg-green-100 text-green-800" :
                  isLocked ? "bg-gray-100 text-gray-800" :
                  program.status === "unlocked" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}
              >
                {isActive && "⏳"} {program.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Reward Pool</p>
                <p className="text-xl font-bold text-blue-900">${program.reward_pool_total.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">XP Bonus</p>
                <p className="text-xl font-bold text-purple-900">{program.xp_bonus_multiplier}x</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Participants</p>
                <p className="text-xl font-bold text-green-900">{program.participation_count}</p>
              </div>
            </div>

            {isActive && timer && (
              <div className="mb-6">
                <EventTimer
                  startedAt={timer.started_at!}
                  duration={timer.duration_hours}
                  className="mb-4"
                />
              </div>
            )}

            {isClosed && (
              <div className="mb-6">
                <ClosedProgramMessage programTitle={program.title} />
              </div>
            )}

            {isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold text-yellow-800 mb-2">🔒 Program Locked</h3>
                <p className="text-sm text-yellow-700">
                  You need {program.min_referrals_required} referrals to unlock this program. You have {referralCount ?? 0}/{program.min_referrals_required} referrals.
                </p>
                <div className="mt-2 bg-yellow-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${Math.min(100, ((referralCount ?? 0) / program.min_referrals_required) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Activities</h3>
              <div className="space-y-2">
                {program.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.activity_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">${activity.reward_amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{activity.xp_reward} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {isActive && (
                <button
                  onClick={handleParticipate}
                  disabled={participating || !hasEnoughReferrals}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {participating ? "Registering..." : hasEnoughReferrals ? "Participate Now" : "Need More Referrals"}
                </button>
              )}
              {isActive && (
                <button
                  onClick={() => router.push(`/events/${slug}/participate`)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                >
                  View My Progress
                </button>
              )}
              {!isClosed && (
                <button onClick={() => router.push("/events")} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                  Back to Events
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}