"use client";

import React, { useEffect, useState, useRef } from "react";
import { Terminal, Shield, Zap, Trophy, Loader2 } from "lucide-react";
import { redTeamApi, RedTeamVault, RedTeamAttempt } from "@/api/redTeamApi";

type TerminalLine = {
  type: "input" | "output" | "system" | "error";
  text: string;
  timestamp: Date;
};

export function RedTeamTerminal() {
  const [vaults, setVaults] = useState<RedTeamVault[]>([]);
  const [selectedVault, setSelectedVault] = useState<RedTeamVault | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [terminal, setTerminal] = useState<TerminalLine[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const data = await redTeamApi.listVaults();
        setVaults(data);
      } catch (error) {
        console.error("Failed to fetch vaults:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVaults();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminal]);

  const addLine = (type: TerminalLine["type"], text: string) => {
    setTerminal((prev) => [...prev, { type, text, timestamp: new Date() }]);
  };

  const handleAttempt = async () => {
    if (!selectedVault || !prompt.trim()) return;
    setSubmitting(true);
    addLine("input", `> ${prompt}`);
    try {
      const result = await redTeamApi.attemptVault(selectedVault.id, prompt);
      addLine("output", `Response: ${result.response || "(empty)"}`);
      if (result.leaked_secret) {
        addLine("system", `BREACH DETECTED! Secret leaked in ${result.latency_ms}ms`);
      } else {
        addLine("system", `No leak detected. Tokens: ${result.tokens_used}, Latency: ${result.latency_ms}ms`);
      }
      setPrompt("");
    } catch (error: any) {
      addLine("error", `Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Shield className="text-indigo-400" size={20} />
          <div>
            <h1 className="text-lg font-bold text-white">AI Arcade</h1>
            <p className="text-[10px] text-slate-400">Outsmart the Guard - Red-Team Terminal</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Vault</p>
          {vaults.length === 0 ? (
            <p className="text-xs text-slate-400">No vaults available</p>
          ) : (
            <div className="space-y-2">
              {vaults.map((vault) => (
                <button
                  key={vault.id}
                  onClick={() => setSelectedVault(vault)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedVault?.id === vault.id
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{vault.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      vault.status === "LOCKED" ? "bg-slate-800 text-slate-400" :
                      vault.status === "BREACHED" ? "bg-rose-500/10 text-rose-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>
                      {vault.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{vault.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Zap size={10} className="text-amber-400" />
                      {vault.entry_fee} TCoin
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy size={10} className="text-indigo-400" />
                      Pool: {vault.reward_pool}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={10} className="text-emerald-400" />
                      {vault.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedVault && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">System Prompt</p>
              <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800 max-h-40 overflow-y-auto">
                {selectedVault.system_prompt}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
                <Terminal size={14} className="text-indigo-400" />
                <p className="text-xs font-bold text-white">Terminal</p>
              </div>
              <div ref={terminalRef} className="h-48 overflow-y-auto p-3 space-y-1 bg-slate-950/40">
                {terminal.length === 0 ? (
                  <p className="text-[10px] text-slate-600">Waiting for input...</p>
                ) : (
                  terminal.map((line, idx) => (
                    <div key={idx} className="text-[10px] font-mono">
                      <span className="text-slate-600">[{line.timestamp.toLocaleTimeString()}]</span>{" "}
                      <span className={
                        line.type === "error" ? "text-rose-400" :
                        line.type === "system" ? "text-amber-400" :
                        line.type === "input" ? "text-indigo-400" : "text-slate-300"
                      }>
                        {line.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAttempt()}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Enter prompt..."
                  />
                  <button
                    onClick={handleAttempt}
                    disabled={submitting || !prompt.trim()}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1"
                  >
                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Terminal size={12} />}
                    Run
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
