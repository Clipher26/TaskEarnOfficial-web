"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Megaphone, Briefcase, LogOut, User } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/context/AuthContext";
import { getTelegramUser } from "@/lib/telegram";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tgUser = getTelegramUser();

  const handleAuthClick = () => {
    if (isAuthenticated || tgUser?.id) {
      if (pathname === "/dashboard") {
        router.push("/auth");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/auth");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const displayName = user?.full_name || user?.username || tgUser?.first_name || "Trader";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
              <Image src="/logo.png" alt="TaskEarn" width={32} height={32} className="object-cover" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                TaskEarn
              </h1>
              <p className="text-[9px] text-emerald-400 font-medium uppercase tracking-widest">
                Trade · Earn · Win
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {(isAuthenticated || tgUser?.id) && <NotificationCenter />}
            
            {(isAuthenticated || tgUser?.id) ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all active:scale-95"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={18} strokeWidth={2} />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {initial}
                </div>
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                aria-label="Sign In"
              >
                <User size={14} className="text-black" />
                <span className="text-[10px] font-bold text-black">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
