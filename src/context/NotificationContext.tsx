"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { notificationApi, NotificationResponse, NotificationListResponse, SendNotificationPayload } from "@/api/notificationApi";
import { useAppStore } from "@/lib/store";

type NotificationContextType = {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (payload: SendNotificationPayload) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useAppStore();
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return;
    if (fetchingRef.current) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;

    fetchingRef.current = true;
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const data: NotificationListResponse = await notificationApi.getMyNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts || error.response?.status === 401 || error.response?.status === 403) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
            }
          } else if (!error.message?.includes("Network Error") && !error.message?.includes("timeout")) {
            console.error("Failed to fetch notifications:", error);
          }
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      } finally {
        if (attempts >= maxAttempts) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    }

    if (attempts < maxAttempts) {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isLoggedIn, user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const sendNotification = async (payload: SendNotificationPayload) => {
    await notificationApi.sendNotification(payload);
  };

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const connectWebSocket = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) return;

      try {
        const backendHost = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/^https?:\/\//, "").replace(/\/$/, "");
        const protocol = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").startsWith("https") ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${backendHost}/ws/v1/notifications?token=${token}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Notification WebSocket connected");
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "notification") {
              const newNotification: NotificationResponse = message.data;
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          if (reconnectAttempts < 5) {
            reconnectAttempts += 1;
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = () => {
        };
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchingRef.current = false;
    };
  }, [isLoggedIn, user?.id, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
