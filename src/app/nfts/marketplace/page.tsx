"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { nftApi, NFTMarketplaceItemResponse } from "@/api/nftApi";
import { Search, Filter, ShoppingCart, ArrowLeft } from "lucide-react";

export default function NFTMarketplacePage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [items, setItems] = useState<NFTMarketplaceItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRarity, setFilterRarity] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
      return;
    }
    loadMarketplace();
  }, [isLoggedIn, filterRarity, filterType]);

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const data = await nftApi.getMarketplace(0, 50, filterRarity || undefined, filterType || undefined);
      setItems(data.items);
    } catch (err) {
      console.error("Failed to load marketplace:", err);
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
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              NFT Marketplace
            </h1>
            <p className="text-gray-400 text-sm mt-1">Buy, sell, and trade NFTs</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search NFTs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-emerald-500">
            <option value="">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-emerald-500">
            <option value="">All Types</option>
            <option value="achievement">Achievement</option>
            <option value="tier">Tier</option>
            <option value="event">Event</option>
            <option value="limited">Limited</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No NFTs listed for sale</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className={`bg-gray-900 border-2 rounded-xl p-4 ${getRarityColor(item.rarity)}`}>
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {getRarityIcon(item.rarity)}
                </div>
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1 capitalize">{item.nft_type}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded capitalize">{item.rarity}</span>
                  <span className="text-emerald-400 font-bold">${item.list_price?.toFixed(2)}</span>
                </div>
                <button onClick={() => router.push(`/nfts/${item.id}/buy`)} className="w-full mt-3 py-2 bg-emerald-600 rounded-lg text-sm hover:bg-emerald-700">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
