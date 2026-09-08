import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

async function withRetry<T>(
  request: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await request();
  } catch (error: any) {
    if (retries <= 0 || error.response?.status === 401 || error.response?.status === 403) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(request, retries - 1, delay * 2);
  }
}

API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unread_count: number;
}

export interface SendNotificationPayload {
  user_id?: string;
  user_ids?: string[];
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  broadcast?: boolean;
}

export enum NotificationType {
  WELCOME = "WELCOME",
  SIGNIN_NEW_DEVICE = "SIGNIN_NEW_DEVICE",
  WITHDRAWAL_NOTICE = "WITHDRAWAL_NOTICE",
  FIRST_TRADE = "FIRST_TRADE",
  REFERRAL_ALERT = "REFERRAL_ALERT",
  ADMIN_BROADCAST = "ADMIN_BROADCAST",
  OFFERWALL_COMPLETED = "OFFERWALL_COMPLETED",
  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export const notificationApi = {
  getMyNotifications: async (limit: number = 20, offset: number = 0, unreadOnly: boolean = false): Promise<NotificationListResponse> => {
    const res = await withRetry(() => API.get(`/api/v1/notifications/me?limit=${limit}&offset=${offset}&unread_only=${unreadOnly}`));
    return res.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const res = await withRetry(() => API.get("/api/v1/notifications/me/unread-count"));
    return res.data;
  },

  markAsRead: async (notificationId: string): Promise<{ status: string }> => {
    const res = await withRetry(() => API.post(`/api/v1/notifications/me/read/${notificationId}`));
    return res.data;
  },

  markAllAsRead: async (): Promise<{ status: string; marked_count: number }> => {
    const res = await withRetry(() => API.post("/api/v1/notifications/me/read-all"));
    return res.data;
  },

  sendNotification: async (payload: SendNotificationPayload): Promise<any> => {
    const res = await withRetry(() => API.post("/api/v1/notifications/send", payload));
    return res.data;
  },

  getTemplates: async (): Promise<any[]> => {
    const res = await withRetry(() => API.get("/api/v1/notifications/templates"));
    return res.data;
  },
};
