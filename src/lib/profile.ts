import { VirtualWallet, Trade, Quest, Tournament, ActivityItem } from "./types";

export interface UserProfileJSON {
  user: {
    id: string;
    telegram_username?: string;
    role: string;
    status: string;
    created_at: string;
  };
  wallet: {
    available_balance_usdt: number;
    locked_margin_usdt: number;
    platform_credits: number;
    tcoin_balance: number;
    cred_balance: number;
    vip_tier: string;
    vip_level: number;
    xp_points: number;
    current_streak: number;
    longest_streak: number;
    active_multiplier: number;
    total_usd_equivalent: number;
  };
  gamification: {
    daily_streak: number;
    weekly_checkins: number;
    today_reward_tcoin: number;
    today_reward_usd: number;
    can_checkin: boolean;
    hours_until_next_checkin: number;
  };
  recent_activity: ActivityItem[];
  active_tournaments: Tournament[];
  quests: {
    available: Quest[];
    claimed: Quest[];
  };
  portfolio: {
    open_trades: number;
    total_pnl: number;
    win_rate: number;
    staked_tcoin: number;
    staked_cred: number;
  };
}

export function formatUserProfileJSON(data: {
  user: any;
  wallet: any;
  gamification: any;
  trades: Trade[];
  tournaments: Tournament[];
  quests: Quest[];
  activities: ActivityItem[];
}): UserProfileJSON {
  const tcoinUsd = data.wallet.tcoin_balance / 30;
  const credUsd = data.wallet.cred_balance / 30;
  const totalUsd = data.wallet.available_balance_usdt + data.wallet.locked_margin_usdt + tcoinUsd + credUsd;

  const closedTrades = data.trades.filter((t) => t.status === "CLOSED" || t.status === "LIQUIDATED");
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter((t) => (t.pnl || 0) > 0).length / closedTrades.length) * 100
    : 0;

  const lastCheckin = data.gamification.last_checkin_at ? new Date(data.gamification.last_checkin_at) : null;
  const now = new Date();
  let canCheckin = false;
  let hoursUntilNext = 24;

  if (lastCheckin) {
    const diffHours = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60);
    if (diffHours >= 24) {
      canCheckin = true;
      hoursUntilNext = 0;
    } else {
      hoursUntilNext = Math.max(0, 24 - diffHours);
    }
  } else {
    canCheckin = true;
    hoursUntilNext = 0;
  }

  const dayInWeek = ((data.gamification.current_streak || 0) % 7) + 1;
  const dailyRewards: Record<number, number> = { 1: 0.3, 2: 0.6, 3: 0.9, 4: 1.2, 5: 1.5, 6: 2.1, 7: 3.0 };
  const todayReward = dailyRewards[dayInWeek] || 0.3;

  return {
    user: {
      id: data.user.id,
      telegram_username: data.user.telegram_username,
      role: data.user.role,
      status: data.user.status,
      created_at: data.user.created_at,
    },
    wallet: {
      available_balance_usdt: data.wallet.available_balance_usdt || 0,
      locked_margin_usdt: data.wallet.locked_margin_usdt || 0,
      platform_credits: data.wallet.platform_credits || 0,
      tcoin_balance: data.wallet.tcoin_balance || 0,
      cred_balance: data.wallet.cred_balance || 0,
      vip_tier: data.gamification.vip_tier || "BRONZE",
      vip_level: data.gamification.vip_level || 1,
      xp_points: data.gamification.xp_points || 0,
      current_streak: data.gamification.current_streak || 0,
      longest_streak: data.gamification.longest_streak || 0,
      active_multiplier: data.gamification.active_multiplier || 1.0,
      total_usd_equivalent: Math.round(totalUsd * 10000) / 10000,
    },
    gamification: {
      daily_streak: data.gamification.current_streak || 0,
      weekly_checkins: data.gamification.weekly_checkins || 0,
      today_reward_tcoin: todayReward,
      today_reward_usd: todayReward / 30,
      can_checkin: canCheckin,
      hours_until_next_checkin: hoursUntilNext,
    },
    recent_activity: data.activities.slice(0, 10),
    active_tournaments: data.tournaments,
    quests: {
      available: data.quests.filter((q) => !q.is_repeatable),
      claimed: [],
    },
    portfolio: {
      open_trades: data.trades.filter((t) => t.status === "OPEN").length,
      total_pnl: Math.round(totalPnl * 100) / 100,
      win_rate: Math.round(winRate * 10) / 10,
      staked_tcoin: 0,
      staked_cred: 0,
    },
  };
}
