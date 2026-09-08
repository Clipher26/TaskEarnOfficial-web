"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { notificationApi, NotificationType } from "@/api/notificationApi";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Shield,
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  AlertTriangle,
  Settings,
} from "lucide-react";

const notificationIcons: Record<NotificationType, React.ElementType> = {
  WELCOME: Sparkles,
  SIGNIN_NEW_DEVICE: Shield,
  WITHDRAWAL_NOTICE: DollarSign,
  FIRST_TRADE: TrendingUp,
  REFERRAL_ALERT: Users,
  ADMIN_BROADCAST: Settings,
  OFFERWALL_COMPLETED: Gift,
  SYSTEM: AlertTriangle,
};

const notificationColors: Record<NotificationType, string> = {
  WELCOME: "text-emerald-400 bg-emerald-500/10",
  SIGNIN_NEW_DEVICE: "text-red-400 bg-red-500/10",
  WITHDRAWAL_NOTICE: "text-amber-400 bg-amber-500/10",
  FIRST_TRADE: "text-indigo-400 bg-indigo-500/10",
  REFERRAL_ALERT: "text-cyan-400 bg-cyan-500/10",
  ADMIN_BROADCAST: "text-purple-400 bg-purple-500/10",
  OFFERWALL_COMPLETED: "text-pink-400 bg-pink-500/10",
  SYSTEM: "text-slate-400 bg-slate-500/10",
};

export function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-96 max-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] text-slate-400">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    const colorClass = notificationColors[notification.type] || "text-slate-400 bg-slate-500/10";
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 hover:bg-slate-800/30 transition-colors cursor-pointer ${
                          !notification.is_read ? "bg-slate-800/20" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-xl ${colorClass}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-medium ${!notification.is_read ? "text-white" : "text-slate-300"}`}>
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-500">
                                {formatTime(notification.created_at)}
                              </span>
                              {notification.action_url && (
                                <ExternalLink size={10} className="text-slate-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    fetchNotifications();
                  }}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
