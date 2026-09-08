"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Quest, TaskPreview, TaskSubmission, TaskDispute, GroupTaskPool, OfferwallOffer } from "@/lib/types";
import { ListChecks, DollarSign, Clock, CheckCircle2, Star, Zap, Mic, Crosshair, MapPin, Users, Bell, Shield, Gauge, Eye } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { TaskPreviewModal } from "@/components/tasks/TaskPreviewModal";
import { AudioTaskRecorder } from "@/components/tasks/AudioTaskRecorder";
import { BoundingBoxAnnotator } from "@/components/tasks/BoundingBoxAnnotator";
import { GeoTaskUploader } from "@/components/tasks/GeoTaskUploader";
import { TaskDisputeModal } from "@/components/tasks/TaskDisputeModal";
import { TaskReminderSettings } from "@/components/tasks/TaskReminderSettings";
import { GroupTaskPoolCard } from "@/components/tasks/GroupTaskPoolCard";
import { taskApi } from "@/api/taskApi";

type TaskTab = "available" | "audio" | "annotation" | "geo" | "group" | "claimed" | "disputes" | "reminders";

export default function TasksPage() {
  const { quests, setActiveModule, wallet } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskTab>("available");
  const [previews, setPreviews] = useState<TaskPreview[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTask, setActiveTask] = useState<Quest | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [disputes, setDisputes] = useState<TaskDispute[]>([]);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [groupPools, setGroupPools] = useState<GroupTaskPool[]>([]);
  const [offerwallTasks, setOfferwallTasks] = useState<OfferwallOffer[]>([]);
  const [lastTaskRefresh, setLastTaskRefresh] = useState<string>(new Date().toISOString().split("T")[0]);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("tasks");
  }, [isLoggedIn, isLoading]);

  const fetchData = useCallback(async () => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );

      const { data } = await supabase
        .from("tasks_and_quests")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) useAppStore.getState().setQuests(data);

      const [submissionsData, disputesData, poolsData, availableTasksData] = await Promise.all([
        taskApi.submissions.list().catch(() => []),
        taskApi.disputes.list().catch(() => []),
        taskApi.groupPools.list("OPEN").catch(() => []),
        taskApi.availableTasks().catch(() => ({ tasks: [], source: "offerwall" })),
      ]);

      setSubmissions(submissionsData);
      setDisputes(disputesData);
      setGroupPools(poolsData);
      const backendTasks = availableTasksData.tasks || [];
      setOfferwallTasks(backendTasks);
      useAppStore.getState().setOfferwallOffers(backendTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastTaskRefresh) {
        setLastTaskRefresh(today);
        fetchData();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastTaskRefresh, fetchData]);

  const loadPreviews = async (offerId: string) => {
    try {
      const data = await taskApi.previews(offerId);
      setPreviews(data);
      setSelectedOfferId(offerId);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to load previews:", error);
    }
  };

  const startTask = async (quest: Quest) => {
    setActiveTask(quest);
    try {
      const submission = await taskApi.submissions.create({
        offer_id: quest.id,
        task_type: "STANDARD",
      });
      setSubmissionId(submission.id);
    } catch (error) {
      console.error("Failed to create submission:", error);
    }
  };

  const startSpecialTask = async (quest: Quest, taskType: string) => {
    setActiveTask(quest);
    try {
      const submission = await taskApi.submissions.create({
        offer_id: quest.id,
        task_type: taskType,
      });
      setSubmissionId(submission.id);
    } catch (error) {
      console.error("Failed to create submission:", error);
    }
  };

  const handleTaskComplete = () => {
    setActiveTask(null);
    setSubmissionId(null);
    taskApi.submissions.list().then(setSubmissions).catch(console.error);
  };

  const handleDisputeSubmit = async (reason: string, evidenceUrls: string[]) => {
    await taskApi.disputes.create({
      offer_id: activeTask?.id,
      reason,
      evidence_urls: evidenceUrls,
    });
    const updatedDisputes = await taskApi.disputes.list();
    setDisputes(updatedDisputes);
  };

  const handleJoinGroupPool = async (poolId: string) => {
    try {
      await taskApi.groupPools.join(poolId);
      const pools = await taskApi.groupPools.list("OPEN");
      setGroupPools(pools);
    } catch (error) {
      console.error("Failed to join pool:", error);
    }
  };

  const taskTypeIcons: Record<string, React.ReactNode> = {
    STANDARD: <ListChecks size={14} className="text-indigo-400" />,
    AUDIO_VOICE: <Mic size={14} className="text-rose-400" />,
    AI_ANNOTATION: <Crosshair size={14} className="text-cyan-400" />,
    GEO_FENCED: <MapPin size={14} className="text-emerald-400" />,
    GROUP_POOL: <Users size={14} className="text-amber-400" />,
    SURVEY: <CheckCircle2 size={14} className="text-violet-400" />,
  };

  const tabs: { id: TaskTab; label: string; icon: React.ReactNode }[] = [
    { id: "available", label: "Available", icon: <ListChecks size={14} /> },
    { id: "audio", label: "Voice", icon: <Mic size={14} /> },
    { id: "annotation", label: "Annotate", icon: <Crosshair size={14} /> },
    { id: "geo", label: "Local", icon: <MapPin size={14} /> },
    { id: "group", label: "Groups", icon: <Users size={14} /> },
    { id: "claimed", label: "Claimed", icon: <CheckCircle2 size={14} /> },
    { id: "disputes", label: "Disputes", icon: <Shield size={14} /> },
    { id: "reminders", label: "Alerts", icon: <Bell size={14} /> },
  ];

  const getSpecialTasks = (type: string) => {
    return quests.filter((q) => q.quest_type.toLowerCase().includes(type.replace("_", " ")));
  };

  if (activeTask && submissionId) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => { setActiveTask(null); setSubmissionId(null); }} className="text-xs text-indigo-400 hover:text-indigo-300">
              Back to Tasks
            </button>
            <h1 className="text-sm font-bold text-white">{activeTask.title}</h1>
            <div className="w-16" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-4">
          {activeTask.quest_type.toLowerCase().includes("audio") && (
            <AudioTaskRecorder submissionId={submissionId} onComplete={handleTaskComplete} />
          )}
          {activeTask.quest_type.toLowerCase().includes("annotation") && (
            <BoundingBoxAnnotator
              submissionId={submissionId}
              imageUrl="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
              onComplete={handleTaskComplete}
            />
          )}
          {activeTask.quest_type.toLowerCase().includes("geo") && (
            <GeoTaskUploader submissionId={submissionId} onComplete={handleTaskComplete} />
          )}
          {(activeTask.quest_type.toLowerCase().includes("survey") ||
            activeTask.quest_type.toLowerCase().includes("standard")) && (
            <div className="glass-card p-4 space-y-4">
              <p className="text-xs text-slate-400">{activeTask.description}</p>
              <button
                onClick={async () => {
                  await taskApi.submissions.update(submissionId, { status: "SUBMITTED" });
                  handleTaskComplete();
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Complete Task
              </button>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-xl hover:bg-rose-500/20 transition-all"
              >
                Report Issue
              </button>
            </div>
          )}
        </main>
        <TaskDisputeModal
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          onSubmit={handleDisputeSubmit}
          existingDisputes={disputes}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-white">Task Hub</h1>
              <p className="text-[10px] text-slate-400">Complete tasks, earn rewards</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <Star size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{wallet?.platform_credits || 0}</span>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-300"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === "available" && (
              <>
                {quests.length === 0 && offerwallTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ListChecks size={48} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No tasks available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quests.map((quest) => (
                      <div key={quest.id} className="glass-card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {taskTypeIcons[quest.quest_type] || taskTypeIcons.STANDARD}
                              <h3 className="text-sm font-semibold text-white">{quest.title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{quest.description}</p>
                          </div>
                          <div className="ml-3 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                              <DollarSign size={10} className="text-emerald-400" />
                              <span className="text-[10px] font-bold text-emerald-400">+{quest.reward_amount}</span>
                            </div>
                            {quest.reward_currency === "CREDITS" && (
                              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                <Zap size={10} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-amber-400">+{quest.reward_amount} CR</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startTask(quest)}
                            className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                          >
                            Start Task
                          </button>
                          <button
                            onClick={() => loadPreviews(quest.id)}
                            className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Clock size={10} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500">
                            {quest.is_repeatable ? "Repeatable daily" : "One-time"}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] text-slate-500">{quest.quest_type}</span>
                        </div>
                      </div>
                    ))}

                    {offerwallTasks.map((task) => (
                      <div key={task.id} className="glass-card p-4 border-indigo-500/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded border border-indigo-500/20">
                                OFFERWALL
                              </span>
                              <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                          </div>
                          <div className="ml-3 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                              <DollarSign size={10} className="text-emerald-400" />
                              <span className="text-[10px] font-bold text-emerald-400">${task.payout_usd.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                              <Star size={10} className="text-amber-400" />
                              <span className="text-[10px] font-bold text-amber-400">+{task.tcoin_reward.toFixed(0)} TCOIN</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Users size={10} />
                            <span>{task.advertiser_name}</span>
                          </div>
                          <button
                            onClick={() => window.open(task.action_url, '_blank')}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl"
                          >
                            Complete Offer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "audio" && (
              <div className="space-y-3">
                {getSpecialTasks("audio").length === 0 ? (
                  <div className="text-center py-8">
                    <Mic size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No voice tasks available</p>
                  </div>
                ) : (
                  getSpecialTasks("audio").map((quest) => (
                    <div key={quest.id} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic size={14} className="text-rose-400" />
                        <h3 className="text-sm font-semibold text-white">{quest.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{quest.description}</p>
                      <button
                        onClick={() => startSpecialTask(quest, "AUDIO_VOICE")}
                        className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-500/20 transition-all"
                      >
                        Record Voice Clip
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "annotation" && (
              <div className="space-y-3">
                {getSpecialTasks("annotation").length === 0 ? (
                  <div className="text-center py-8">
                    <Crosshair size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No annotation tasks available</p>
                  </div>
                ) : (
                  getSpecialTasks("annotation").map((quest) => (
                    <div key={quest.id} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Crosshair size={14} className="text-cyan-400" />
                        <h3 className="text-sm font-semibold text-white">{quest.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{quest.description}</p>
                      <button
                        onClick={() => startSpecialTask(quest, "AI_ANNOTATION")}
                        className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-500/20 transition-all"
                      >
                        Start Annotation
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "geo" && (
              <div className="space-y-3">
                {getSpecialTasks("geo").length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No local tasks available</p>
                  </div>
                ) : (
                  getSpecialTasks("geo").map((quest) => (
                    <div key={quest.id} className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-emerald-400" />
                        <h3 className="text-sm font-semibold text-white">{quest.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{quest.description}</p>
                      <button
                        onClick={() => startSpecialTask(quest, "GEO_FENCED")}
                        className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all"
                      >
                        Start Local Task
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "group" && (
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-xs text-amber-300">
                    Group pools offer higher payouts when enough users join. Pool closes when filled or after 1 hour.
                  </p>
                </div>
                {groupPools.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No active group pools</p>
                  </div>
                ) : (
                  groupPools.map((pool) => (
                    <GroupTaskPoolCard
                      key={pool.id}
                      pool={pool}
                      onJoin={() => handleJoinGroupPool(pool.id)}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "claimed" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 size={48} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No claimed tasks yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Complete tasks to see them here.</p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div key={submission.id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {taskTypeIcons[submission.task_type] || taskTypeIcons.STANDARD}
                          <span className="text-xs font-medium text-white capitalize">{submission.task_type.replace(/_/g, " ")}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          submission.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                          submission.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" :
                          submission.status === "SUBMITTED" ? "bg-amber-500/10 text-amber-400" :
                          "bg-slate-500/10 text-slate-400"
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">Started: {submission.started_at ? new Date(submission.started_at).toLocaleString() : "N/A"}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "disputes" && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Shield size={14} />
                  New Dispute
                </button>
                {disputes.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No disputes filed</p>
                  </div>
                ) : (
                  disputes.map((dispute) => (
                    <div key={dispute.id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white line-clamp-2">{dispute.reason}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dispute.status === "OPEN" ? "bg-amber-500/10 text-amber-400" :
                          dispute.status.includes("RESOLVED") ? "bg-emerald-500/10 text-emerald-400" :
                          "bg-slate-500/10 text-slate-400"
                        }`}>
                          {dispute.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {dispute.resolution && <p className="text-xs text-slate-400 mb-2">{dispute.resolution}</p>}
                      <p className="text-[10px] text-slate-500">{new Date(dispute.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "reminders" && (
              <TaskReminderSettings userId={useAppStore.getState().user?.id || ""} />
            )}
          </div>
        )}
      </main>

      <TaskPreviewModal previews={previews} onClose={() => setShowPreview(false)} />
      <TaskDisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        onSubmit={handleDisputeSubmit}
        existingDisputes={disputes}
      />
      <BottomNav />
    </div>
  );
}
