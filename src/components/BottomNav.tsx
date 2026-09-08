"use client";

import React from "react";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { Home, Dice1, Radio, ListChecks, User, MoreHorizontal, Flame, Crown, Trophy, Users, Lock, ShieldCheck, UserPlus, Wallet, Settings2, Gift, CreditCard, Award, Swords, Target, Play, Palette, MessageCircle, TrendingUp, Store, Gamepad2, Crosshair, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getTelegramUser } from "@/lib/telegram";
import { useRouter } from "next/navigation";

const primaryNavItems = [
  { id: "tasks" as const, label: "Tasks Hub", icon: ListChecks, auth: true, route: "/tasks" },
  { id: "offerwall" as const, label: "Offers", icon: Store, auth: true, route: "/offerwall" },
  { id: "earnpoly" as const, label: "Earnpoly", icon: Dice1, image: "/images/earnpoly.png", auth: true, route: "/earnpoly" },
  { id: "dashboard" as const, label: "Home", icon: Home, auth: true, route: "/dashboard" },
  { id: "trade" as const, label: "Trade", icon: TrendingUp, image: "/images/trade.png", auth: true, route: "/trade" },
  { id: "signals" as const, label: "Signals", icon: Radio, image: "/images/signal.png", auth: true, route: "/signals" },
  { id: "earnflex" as const, label: "EarnFlex", icon: Briefcase, image: "/images/earnflex.png", auth: true, route: "/earnflex/dashboard" },
  { id: "profile" as const, label: "Profile", icon: User, image: "/images/profile.png", auth: true, route: "/profile" },
];

const secondaryNavItems = [
  { id: "streak" as const, label: "Streak", icon: Flame, auth: true, route: "/streak" },
  { id: "vip" as const, label: "VIP", icon: Crown, auth: true, route: "/vip" },
  { id: "leaderboard" as const, label: "Ranks", icon: Trophy, auth: false, route: "/leaderboard" },
  { id: "guilds" as const, label: "Guilds", icon: Users, auth: true, route: "/guilds" },
  { id: "staking" as const, label: "Stake", icon: Lock, auth: true, route: "/staking" },
  { id: "p2p" as const, label: "P2P", icon: ShieldCheck, auth: true, route: "/p2p" },
  { id: "referral" as const, label: "Referral", icon: UserPlus, auth: true, route: "/referral" },
  { id: "social-feed" as const, label: "Feed", icon: TrendingUp, auth: true, route: "/social-feed" },
  { id: "chat" as const, label: "Chat", icon: MessageCircle, auth: true, route: "/chat" },
  { id: "bounty-board" as const, label: "Bounties", icon: Award, auth: true, route: "/bounty-board" },
  { id: "wallet-vaults" as const, label: "Vaults", icon: Lock, auth: true, route: "/wallet-vaults" },
  { id: "auto-withdraw" as const, label: "AutoWD", icon: Settings2, auth: true, route: "/auto-withdraw" },
  { id: "gift-cards" as const, label: "Gifts", icon: Gift, auth: true, route: "/gift-cards" },
  { id: "debit-card" as const, label: "Card", icon: CreditCard, auth: true, route: "/debit-card" },
  { id: "badges" as const, label: "Badges", icon: Award, auth: true, route: "/badges" },
  { id: "boss-battle" as const, label: "Boss", icon: Swords, auth: true, route: "/boss-battle" },
  { id: "mystery-boxes" as const, label: "Mystery", icon: Gift, auth: true, route: "/mystery-boxes" },
  { id: "achievements" as const, label: "Achieve", icon: Target, auth: true, route: "/achievements" },
  { id: "tournaments" as const, label: "Tourney", icon: Trophy, auth: true, route: "/tournaments" },
  { id: "streams" as const, label: "Streams", icon: Play, auth: true, route: "/streams" },
  { id: "profile-customization" as const, label: "Skins", icon: Palette, auth: true, route: "/profile-customization" },
  { id: "earnflip" as const, label: "Earn Flip", icon: Gamepad2, image: "/images/earnflip.png", auth: true, route: "/earnflip" },
  { id: "earnclash" as const, label: "Earn Clash", icon: Crosshair, image: "/images/earnclash.png", auth: true, route: "/earnclash" },
];

export const BottomNav: React.FC = () => {
  const { activeModule, setActiveModule } = useAppStore();
  const router = useRouter();
  const [showMore, setShowMore] = React.useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const tgUser = getTelegramUser();
  const isLoggedIn = isAuthenticated || !!tgUser?.id;

  const visiblePrimary = isLoggedIn 
    ? primaryNavItems 
    : primaryNavItems.filter(item => !item.auth);
  
  const visibleSecondary = isLoggedIn 
    ? secondaryNavItems 
    : secondaryNavItems.filter(item => !item.auth);

  const allNavItems = [...visiblePrimary, ...visibleSecondary];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
          {visiblePrimary.map((item) => {
            const isActive = activeModule === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  router.push(item.route);
                }}
                className={`
                  flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl
                  transition-all duration-200 min-w-[52px]
                  ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}
                `}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-500/10" : ""}`}>
                  {item.image ? (
                    <Image src={item.image} alt={item.label} width={18} height={18} className="rounded-md" />
                  ) : (
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </div>
                <span className={`text-[9px] font-medium ${isActive ? "text-indigo-400" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
                )}
              </button>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`
              flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl
              transition-all duration-200 min-w-[52px]
              ${showMore ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            <div className={`p-1.5 rounded-xl transition-all ${showMore ? "bg-indigo-500/10" : ""}`}>
              <MoreHorizontal size={18} strokeWidth={showMore ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-medium ${showMore ? "text-indigo-400" : ""}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-4 right-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
            <div className="grid grid-cols-5 gap-3">
              {visibleSecondary.map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      setShowMore(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      router.push(item.route);
                    }}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                      ${isActive ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:text-slate-200"}
                    `}
                  >
                    {item.image ? (
                      <Image src={item.image} alt={item.label} width={22} height={22} className="rounded-md" />
                    ) : (
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};