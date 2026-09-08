"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { nftApi, NFTOwnership } from "@/api/nftApi";
import { Lock, Crown, Sparkles, Shield, TrendingUp, Award } from "lucide-react";

export default function NFTsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [nfts, setNfts] = useState<NFTOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "achievement" | "tier" | "event" | "limited">("all");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadNFTs();
  }, [isLoggedIn, activeTab]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const data = await nftApi.getUserNFTs(0, 50);
      const filtered = activeTab === "all" ? data : data.filter((nft: any) => nft.nft?.nft_type === activeTab);
      setNfts(filtered);
    } catch (err) {
      console.error("Failed to load NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common": return "text-gray-400 border-gray-400";
      case "uncommon": return "text-blue-400 border-blue-400";
      case "rare": return "text-purple-400 border-purple-400";
      case "epic": return "text-orange-400 border-orange-400";
      case "legendary": return "text-yellow-400 border-yellow-400";
      case "mythic": return "text-pink-400 border-pink-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common": return "⭐";
      case "uncommon": return "🌟";
      case "rare": return "💫";
      case "epic": return "🔥";
      case "legendary": return "👑";
      case "mythic": return "🌌";
      default: return "⭐";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              My NFTs
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your NFT collection and achievements</p>
          </div>
          <button onClick={() => router.push("/nfts/marketplace")} className="px-4 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-700">
            Marketplace
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "achievement", "tier", "event", "limited"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No NFTs found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft) => (
              <div key={nft.id} className={`bg-gray-900 border-2 rounded-xl p-4 ${getRarityColor(nft.nft?.rarity || "common")}`}>
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {getRarityIcon(nft.nft?.rarity || "common")}
                </div>
                <h3 className="font-semibold text-sm truncate">{nft.nft?.name || "Unknown NFT"}</h3>
                <p className="text-xs text-gray-400 mt-1 capitalize">{nft.nft?.nft_type || "unknown"}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded capitalize">{nft.nft?.rarity || "common"}</span>
                  {nft.is_staked && <span className="text-xs text-emerald-400">Staked</span>}
                </div>
                {nft.nft?.earning_bonus > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    +{(nft.nft.earning_bonus * 100).toFixed(0)}% bonus
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
