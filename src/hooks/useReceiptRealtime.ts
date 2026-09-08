"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ReceiptStatus {
  id: string;
  user_id: string;
  image_url: string;
  amount: number | null;
  currency: string | null;
  status: string;
  confidence_score: number | null;
  detected_anomalies: string[] | null;
  extracted_metadata: Record<string, any> | null;
  forensic_reasoning: string | null;
  error_log: string | null;
  admin_verdict: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  balance_credited: boolean;
  credited_amount: number | null;
  credited_at: string | null;
  auto_processed: boolean;
  created_at: string;
  updated_at: string;
}

export function useReceiptRealtime(receiptId: string | null) {
  const [receipt, setReceipt] = useState<ReceiptStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!receiptId) return;

    const fetchInitial = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("receipt_images")
        .select("*")
        .eq("id", receiptId)
        .single();

      if (data) setReceipt(data as ReceiptStatus);
      setLoading(false);
    };

    fetchInitial();

    const channel = supabase
      .channel(`receipt:${receiptId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "receipt_images",
          filter: `id=eq.${receiptId}`,
        },
        (payload) => {
          setReceipt(payload.new as ReceiptStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [receiptId]);

  return { receipt, loading };
}
