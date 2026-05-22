import { notFound } from "next/navigation";

import { OrderRealtimeCard } from "@/features/orders/order-realtime-card";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <OrderRealtimeCard order={order} />
    </main>
  );
}
