"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Grid3X3,
  Palette,
  Zap,
  UserCheck,
  TrendingUp,
  Globe,
  ShieldCheck,
  Gamepad2,
  Crosshair,
} from "lucide-react";

interface FeatureItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  image?: string;
  href: string;
  accent?: "emerald" | "cyan" | "amber" | "rose" | "violet";
  badge?: string;
}

const features: FeatureItem[] = [
  {
    id: "tasks",
    label: "Tasks Hub",
    icon: Briefcase,
    href: "/tasks",
    accent: "emerald",
  },
  {
    id: "earnpoly",
    label: "Earnpoly",
    image: "/images/earnpoly.png",
    href: "/earnpoly",
    accent: "cyan",
  },
  {
    id: "earnflex",
    label: "EarnFlex",
    image: "/images/earnflex.png",
    href: "/earnflex/dashboard",
    accent: "cyan",
  },
  {
    id: "trade",
    label: "Trade Terminal",
    image: "/images/trade.png",
    href: "/trade",
    accent: "violet",
  },
  {
    id: "signals",
    label: "Signals",
    image: "/images/signal.png",
    href: "/signals",
    accent: "amber",
    badge: "+3",
  },
  {
    id: "profile",
    label: "Profile",
    image: "/images/profile.png",
    href: "/profile",
    accent: "violet",
  },
  {
    id: "streak",
    label: "Daily Streak",
    icon: UserCheck,
    href: "/streak",
    accent: "rose",
    badge: "+7d",
  },
  {
    id: "staking",
    label: "Staking",
    icon: TrendingUp,
    href: "/staking",
    accent: "emerald",
  },
  {
    id: "p2p",
    label: "P2P Escrow",
    icon: Globe,
    href: "/p2p",
    accent: "cyan",
  },
  {
    id: "vip",
    label: "Upgrade VIP",
    icon: ShieldCheck,
    href: "/vip",
    accent: "amber",
  },
  {
    id: "earnflip",
    label: "Earn Flip",
    image: "/images/earnflip.png",
    href: "/earnflip",
    accent: "violet",
  },
  {
    id: "earnclash",
    label: "Earn Clash",
    image: "/images/earnclash.png",
    href: "/earnclash",
    accent: "rose",
  },
];

const accentStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    glow: "shadow-rose-500/10",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
};

export const FeatureGrid: React.FC = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-4 gap-3">
      {features.map((item) => {
        const style = accentStyles[item.accent || "emerald"];

        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`
              relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
              bg-slate-900 border border-slate-800
              hover:border-slate-700 hover:bg-slate-850
              active:scale-95 transition-all duration-200
              shadow-lg ${style.glow}
              group
            `}
          >
            <div className={`p-2 rounded-xl ${style.bg} border ${style.border} group-hover:scale-110 transition-transform flex items-center justify-center`}>
              {item.image ? (
                <Image src={item.image} alt={item.label} width={20} height={20} className="rounded-sm" />
              ) : item.icon ? (
                <item.icon size={20} strokeWidth={2} className={style.text} />
              ) : null}
            </div>
            <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-emerald-500 text-black px-1.5 py-0.5 rounded-full shadow-md">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
