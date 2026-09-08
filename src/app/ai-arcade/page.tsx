"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { RedTeamTerminal } from "@/components/ai-arcade/RedTeamTerminal";
import { VaultRewardBadge } from "@/components/ai-arcade/VaultRewardBadge";
import { redTeamApi, RedTeamVault } from "@/api/redTeamApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";

export default function AIArcadePage() {
  const { setActiveModule } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<RedTeamVault[]>([]);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("ai-arcade");
  }, [isLoggedIn, isLoading]);

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
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">AI Arcade</h1>
          <p className="text-[10px] text-slate-400">Outsmart the Guard - Red-Team Challenge</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Vaults</p>
          {vaults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400">No vaults available</p>
              <p className="text-xs text-slate-500 mt-1">Check back later for new challenges!</p>
            </div>
          ) : (
            vaults.map((vault) => <VaultRewardBadge key={vault.id} vault={vault} />)
          )}
        </div>

        <RedTeamTerminal />
      </main>

      <BottomNav />
    </div>
  );
}
