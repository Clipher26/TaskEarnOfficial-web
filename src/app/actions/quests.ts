import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processDailyCheckin(userId: string) {
  const { data: wallet } = await supabase
    .from("user_virtual_wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    return { success: false, error: "Wallet not found" };
  }

  const now = new Date();
  const lastCheckin = wallet.last_checkin_at ? new Date(wallet.last_checkin_at) : null;
  let streak = wallet.streak_count || 0;
  let newStreak = streak;
  let credits = 0;

  if (!lastCheckin) {
    newStreak = 1;
    credits = 10;
  } else {
    const diffMs = now.getTime() - lastCheckin.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 24 && diffHours < 48) {
      newStreak = streak + 1;
      credits = 10 * Math.min(newStreak, 7);
    } else if (diffHours >= 48) {
      newStreak = 1;
      credits = 10;
    } else {
      return { success: false, error: "Already checked in today", streak, credits: 0 };
    }
  }

  const newCredits = wallet.platform_credits + credits;

  const { error: updateError } = await supabase
    .from("user_virtual_wallets")
    .update({
      streak_count: newStreak,
      last_checkin_at: now.toISOString(),
      platform_credits: newCredits,
    })
    .eq("user_id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from("ledger_transactions").insert({
    user_id: userId,
    type: "DAILY_STREAK_BONUS",
    amount: credits,
    balance_after: newCredits,
  });

  return {
    success: true,
    streak: newStreak,
    credits,
    newBalance: newCredits,
  };
}

export type CheckinResult = {
  success: boolean;
  error?: string;
  streak?: number;
  credits?: number;
  newBalance?: number;
};
