export type CommissionPayout = {
  referrerId: string;
  amount: number;
};

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processFeeCommission(
  userId: string,
  grossFee: number,
  sourceType: "TRADING_FEE" | "CASINO_RAKE"
) {
  const tier1Rate = 0.15;
  const tier2Rate = 0.05;

  const { data: tier1 } = await supabase
    .from("affiliates")
    .select("referrer_id")
    .eq("referee_id", userId)
    .eq("tier_level", 1)
    .single();

  const { data: tier2 } = tier1?.referrer_id
    ? await supabase
        .from("affiliates")
        .select("referrer_id")
        .eq("referee_id", tier1.referrer_id)
        .eq("tier_level", 1)
        .single()
    : { data: null };

  const payouts: Array<{ referrerId: string; amount: number }> = [];

  if (tier1?.referrer_id) {
    payouts.push({ referrerId: tier1.referrer_id, amount: grossFee * tier1Rate });
  }
  if (tier2?.referrer_id) {
    payouts.push({ referrerId: tier2.referrer_id, amount: grossFee * tier2Rate });
  }

  for (const payout of payouts) {
    const { data: wallet } = await supabase
      .from("user_virtual_wallets")
      .select("available_balance_usdt")
      .eq("user_id", payout.referrerId)
      .single();

    if (!wallet) continue;

    const newBalance = (wallet.available_balance_usdt || 0) + payout.amount;

    await supabase
      .from("user_virtual_wallets")
      .update({ available_balance_usdt: newBalance })
      .eq("user_id", payout.referrerId);

    await supabase.from("affiliate_payouts").insert({
      referrer_id: payout.referrerId,
      source_user_id: userId,
      source_type: sourceType,
      gross_amount: grossFee,
      commission_paid: payout.amount,
    });

    await supabase.from("ledger_transactions").insert({
      user_id: payout.referrerId,
      type: sourceType === "TRADING_FEE" ? "AFFILIATE_REWARD_T1" : "AFFILIATE_REWARD_T2",
      amount: payout.amount,
      balance_after: newBalance,
    });
  }

  return { success: true, payouts };
}
