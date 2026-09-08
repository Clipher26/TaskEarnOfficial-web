"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { profileApi } from "@/api/profileApi";
import { ProfileSkin, UserProfileCustomization } from "@/lib/types";
import { Palette, Sparkles, Flame, Crown, Shield, CheckCircle2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const SKIN_TYPE_ICONS: Record<string, string> = {
  FRAME: "🖼️",
  GLOW: "✨",
  AVATAR: "👤",
};

export default function ProfileCustomizationPage() {
  const { setActiveModule, userCustomizations, setUserCustomizations, wallet } = useAppStore();
  const [skins, setSkins] = useState<ProfileSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const { isLoggedIn, isLoading } = useRequireAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) return;
    setActiveModule("profile-customization");
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skinsRes, customRes] = await Promise.all([
          profileApi.listSkins(),
          profileApi.getUserCustomizations(),
        ]);
        setSkins(skinsRes.skins);
        setUserCustomizations(customRes.customizations);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setUserCustomizations]);

  const handlePurchase = async (skinId: string) => {
    setPurchasing(skinId);
    try {
      const res = await profileApi.purchaseSkin(skinId);
      const customRes = await profileApi.getUserCustomizations();
      setUserCustomizations(customRes.customizations);
    } catch (error) {
      console.error("Failed to purchase skin:", error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (customizationId: string) => {
    setEquipping(customizationId);
    try {
      await profileApi.equipSkin(customizationId);
      const customRes = await profileApi.getUserCustomizations();
      setUserCustomizations(customRes.customizations);
    } catch (error) {
      console.error("Failed to equip skin:", error);
    } finally {
      setEquipping(null);
    }
  };

  const isOwned = (skinId: string) => userCustomizations.some((c) => c.skin_id === skinId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white">Profile Customization</h1>
          <p className="text-[10px] text-slate-400">Buy frames, glows, and avatar skins with TCoin</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={18} className="text-pink-400" />
            <h2 className="text-sm font-semibold text-white">Your Customizations</h2>
          </div>
          {userCustomizations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No customizations yet. Browse the shop!</p>
          ) : (
            <div className="space-y-2">
              {userCustomizations.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 ${
                    c.is_equipped ? "border-emerald-500/30" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{SKIN_TYPE_ICONS[c.skin_type] || "🎨"}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{c.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{c.skin_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.is_equipped ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Equipped
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquip(c.id)}
                        disabled={equipping === c.id}
                        className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold disabled:opacity-50"
                      >
                        {equipping === c.id ? "..." : "Equip"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Shop</h2>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <Flame size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{wallet?.tcoin_balance || 0} TCN</span>
            </div>
          </div>
          <div className="space-y-2">
            {skins.map((skin) => {
              const owned = isOwned(skin.id);
              const equipped = userCustomizations.find((c) => c.skin_id === skin.id)?.is_equipped;
              return (
                <div
                  key={skin.id}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-slate-950/60 ${
                    equipped ? "border-emerald-500/30" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{SKIN_TYPE_ICONS[skin.skin_type] || "🎨"}</div>
                    <div>
                      <p className="text-xs font-bold text-white">{skin.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{skin.skin_type}</p>
                      {skin.is_limited && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Limited
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {owned ? (
                      equipped ? (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Equipped
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEquip(userCustomizations.find((c) => c.skin_id === skin.id)!.id)}
                          disabled={equipping === userCustomizations.find((c) => c.skin_id === skin.id)!.id}
                          className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold disabled:opacity-50"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handlePurchase(skin.id)}
                        disabled={purchasing === skin.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold disabled:opacity-50"
                      >
                        <Flame size={10} />
                        {purchasing === skin.id ? "..." : `${skin.price_tcoin} TCN`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
