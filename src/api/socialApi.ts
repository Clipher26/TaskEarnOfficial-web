import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface EarningFeedEntry {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  metadata?: string;
  is_public: boolean;
  created_at: string;
  reaction_count?: number;
  user_reaction?: string;
  username?: string;
}

export interface FeedReaction {
  id: string;
  feed_entry_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface TipTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount_tcoin: number;
  message?: string;
  status: string;
  tx_hash?: string;
  created_at: string;
  recipient_username?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  room_type: string;
  category?: string;
  description?: string;
  is_moderated: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  reply_to_id?: string;
  is_pinned: boolean;
  created_at: string;
  username?: string;
}

export interface BountyBoardEntry {
  id: string;
  poster_id: string;
  title: string;
  description?: string;
  reward_amount: number;
  reward_currency: string;
  status: string;
  completions: number;
  max_completions?: number;
  expiry_date?: string;
  task_url?: string;
  is_approved: boolean;
  created_at: string;
  poster_username?: string;
}

export interface OfferRating {
  id: string;
  offer_id: string;
  user_id: string;
  difficulty_rating: number;
  accuracy_rating: number;
  review_text?: string;
  created_at: string;
  username?: string;
}

export interface SharedTaskLink {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  share_code: string;
  total_clicks: number;
  total_completions: number;
  total_bonus_earned: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralLandingPage {
  id: string;
  user_id: string;
  custom_title?: string;
  welcome_message?: string;
  brand_color?: string;
  logo_url?: string;
  is_published: boolean;
  views_count: number;
  conversions_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatorPartner {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  follower_count?: number;
  promo_code: string;
  revenue_share_pct: number;
  total_referred: number;
  total_earned_usdt: number;
  status: string;
  created_at: string;
}

export interface ReferralLadderEntry {
  user_id: string;
  username: string;
  total_usdt: number;
  total_tcoin: number;
  referral_count: number;
  rank: number;
}

export interface Guild {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  vault_tcoin: number;
  total_xp: number;
  total_tasks: number;
  member_count: number;
  max_members: number;
  is_active: boolean;
  created_at: string;
  user_role?: string;
}

export interface GuildMember {
  guild_id: string;
  user_id: string;
  role: string;
  xp_contributed: number;
  tasks_completed: number;
  joined_at: string;
  username?: string;
}

export interface GuildWar {
  id: string;
  guild_id: string;
  opponent_guild_id?: string;
  title: string;
  prize_pool: number;
  status: string;
  start_date?: string;
  end_date?: string;
  guild_score: number;
  opponent_score: number;
  created_at: string;
}

export const socialApi = {
  createFeedEntry: async (payload: { event_type: string; title: string; description?: string; amount?: number; currency?: string; metadata?: string; is_public?: boolean }): Promise<EarningFeedEntry> => {
    const res = await API.post("/social/feed", payload);
    return res.data;
  },

  getFeed: async (): Promise<EarningFeedEntry[]> => {
    const res = await API.get("/social/feed");
    return res.data;
  },

  getMyFeed: async (): Promise<EarningFeedEntry[]> => {
    const res = await API.get("/social/feed/me");
    return res.data;
  },

  addReaction: async (feed_entry_id: string, reaction_type: string): Promise<FeedReaction> => {
    const res = await API.post("/social/reactions", { feed_entry_id, reaction_type });
    return res.data;
  },

  getReactions: async (feed_entry_id: string): Promise<FeedReaction[]> => {
    const res = await API.get(`/social/reactions/${feed_entry_id}`);
    return res.data;
  },

  tipTCoin: async (recipient_id: string, amount_tcoin: number, message?: string): Promise<TipTransaction> => {
    const res = await API.post("/social/tip", { recipient_id, amount_tcoin, message });
    return res.data;
  },

  getTipHistory: async (): Promise<TipTransaction[]> => {
    const res = await API.get("/social/tips/history");
    return res.data;
  },

  createSharedLink: async (task_id: string, task_title: string): Promise<SharedTaskLink> => {
    const res = await API.post("/social/shared-links", { task_id, task_title });
    return res.data;
  },

  getSharedLinks: async (): Promise<SharedTaskLink[]> => {
    const res = await API.get("/social/shared-links");
    return res.data;
  },

  createLandingPage: async (payload: { custom_title?: string; welcome_message?: string; brand_color?: string; logo_url?: string; is_published?: boolean }): Promise<ReferralLandingPage> => {
    const res = await API.post("/social/landing-page", payload);
    return res.data;
  },

  getLandingPage: async (): Promise<ReferralLandingPage> => {
    const res = await API.get("/social/landing-page");
    return res.data;
  },

  createCreatorPartner: async (payload: { platform: string; handle: string; follower_count?: number; revenue_share_pct?: number }): Promise<CreatorPartner> => {
    const res = await API.post("/social/creator-partner", payload);
    return res.data;
  },

  getCreatorPartner: async (): Promise<CreatorPartner> => {
    const res = await API.get("/social/creator-partner");
    return res.data;
  },

  createBounty: async (payload: { title: string; description?: string; reward_amount: number; reward_currency?: string; max_completions?: number; expiry_date?: string; task_url?: string }): Promise<BountyBoardEntry> => {
    const res = await API.post("/social/bounties", payload);
    return res.data;
  },

  getBounties: async (status?: string): Promise<BountyBoardEntry[]> => {
    const res = await API.get("/social/bounties", { params: { status } });
    return res.data;
  },

  approveBounty: async (bounty_id: string): Promise<BountyBoardEntry> => {
    const res = await API.post(`/social/bounties/${bounty_id}/approve`);
    return res.data;
  },

  rejectBounty: async (bounty_id: string): Promise<BountyBoardEntry> => {
    const res = await API.post(`/social/bounties/${bounty_id}/reject`);
    return res.data;
  },

  rateOffer: async (payload: { offer_id: string; difficulty_rating: number; accuracy_rating: number; review_text?: string }): Promise<OfferRating> => {
    const res = await API.post("/social/ratings", payload);
    return res.data;
  },

  getOfferRatings: async (offer_id: string): Promise<OfferRating[]> => {
    const res = await API.get(`/social/ratings/${offer_id}`);
    return res.data;
  },

  getChatRooms: async (): Promise<ChatRoom[]> => {
    const res = await API.get("/chat/rooms");
    return res.data;
  },

  getChatMessages: async (room_id: string): Promise<ChatMessage[]> => {
    const res = await API.get(`/chat/rooms/${room_id}/messages`);
    return res.data;
  },

  sendChatMessage: async (room_id: string, content: string, message_type?: string, reply_to_id?: string): Promise<ChatMessage> => {
    const res = await API.post(`/chat/rooms/${room_id}/messages`, { content, message_type, reply_to_id });
    return res.data;
  },

  createGuild: async (payload: { name: string; description?: string }): Promise<Guild> => {
    const res = await API.post("/social/guilds", payload);
    return res.data;
  },

  getGuilds: async (): Promise<Guild[]> => {
    const res = await API.get("/social/guilds");
    return res.data;
  },

  getMyGuild: async (): Promise<Guild | null> => {
    const res = await API.get("/social/guilds/my");
    return res.data;
  },

  joinGuild: async (guild_id: string): Promise<GuildMember> => {
    const res = await API.post(`/social/guilds/${guild_id}/join`);
    return res.data;
  },

  getGuildMembers: async (guild_id: string): Promise<GuildMember[]> => {
    const res = await API.get(`/social/guilds/${guild_id}/members`);
    return res.data;
  },

  createGuildWar: async (guild_id: string, payload: { opponent_guild_id?: string; title: string; prize_pool: number }): Promise<GuildWar> => {
    const res = await API.post(`/social/guilds/${guild_id}/wars`, payload);
    return res.data;
  },

  getGuildWars: async (): Promise<GuildWar[]> => {
    const res = await API.get("/social/guilds/wars");
    return res.data;
  },

  getReferralLadder: async (period?: string): Promise<ReferralLadderEntry[]> => {
    const res = await API.get("/social/referral-ladder", { params: { period } });
    return res.data;
  },
};
