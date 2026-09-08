"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { ZkProofUploader } from "@/components/ghost-tasks/ZkProofUploader";
import { ghostTaskApi, GhostTask, GhostTaskProof } from "@/api/ghostTaskApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";

export default function GhostTasksPage() {
  const { setActiveModule } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<GhostTask[]>([]);
  const [proofs, setProofs] = useState<GhostTaskProof[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("ghost-tasks");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, proofsData] = await Promise.all([
          ghostTaskApi.listTasks(),
          ghostTaskApi.getMyProofs().catch(() => []),
        ]);
        setTasks(tasksData);
        setProofs(proofsData);
      } catch (error) {
        console.error("Failed to fetch ghost tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerified = (proof: GhostTaskProof) => {
    setProofs((prev) => [proof, ...prev]);
    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Ghost Tasks</h1>
          <p className="text-[10px] text-slate-400">zkTLS cryptographic proof verification</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {selectedTask ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedTaskId(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              &larr; Back to tasks
            </button>
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-indigo-400" size={16} />
                <h3 className="text-sm font-bold text-white">{selectedTask.title}</h3>
              </div>
              <p className="text-xs text-slate-400">{selectedTask.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Reward: {selectedTask.reward_amount} {selectedTask.reward_currency}</span>
                <span>Proof: {selectedTask.required_proof_type}</span>
              </div>
            </div>
            <ZkProofUploader
              taskId={selectedTask.id}
              targetUrl={selectedTask.target_url}
              requiredClaim={selectedTask.required_claim}
              onVerified={handleVerified}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available Ghost Tasks</p>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Shield size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No ghost tasks available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-full text-left p-4 glass-card hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-bold text-white">{task.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {task.required_proof_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>Reward: {task.reward_amount} {task.reward_currency}</span>
                        <span>Completed: {task.total_completions}/{task.max_participants || "∞"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {proofs.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">My Proofs</p>
                {proofs.map((proof) => (
                  <div key={proof.id} className="glass-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Proof #{proof.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-slate-400">Task: {proof.task_id.slice(0, 8)}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      proof.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {proof.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
