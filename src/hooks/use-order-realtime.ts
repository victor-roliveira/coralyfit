"use client";

import { useEffect, useState } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export function useOrderRealtime(initialOrder: OrderRow | null) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (!initialOrder?.id || !hasSupabaseEnv()) return;

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`order:${initialOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${initialOrder.id}`
        },
        (payload) => {
          setOrder(payload.new as OrderRow);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initialOrder?.id]);

  return order;
}
