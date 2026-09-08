import { useState, useEffect } from "react";

export interface UserVipData {
  currentVipLevel: number;
  currentTier: string;
  totalXp: number;
  currentMultiplier: number;
  nextTierGoalXp: number;
  nextTierTitle: string;
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function useVipData(userId?: string) {
  const [data, setData] = useState<UserVipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchVipData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/v1/gamification/users/${userId}/vip`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch VIP data: ${response.statusText}`);
        }

        const result = await response.json();

        if (!cancelled) {
          setData({
            currentVipLevel: result.current_vip_level,
            currentTier: result.current_tier,
            totalXp: result.total_xp,
            currentMultiplier: result.current_multiplier,
            nextTierGoalXp: result.next_tier_goal_xp,
            nextTierTitle: result.next_tier_title,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVipData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, loading, error };
}
