"use client";

import Link from "next/link";
import { RadioTower } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { useOrderRealtime } from "@/hooks/use-order-realtime";
import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export function OrderRealtimeCard({ order: initialOrder }: { order: OrderRow }) {
  const order = useOrderRealtime(initialOrder);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RadioTower className="h-5 w-5 text-primary" />
          Pedido em tempo real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg bg-muted p-4 sm:grid-cols-3">
          <Info label="Pedido" value={order?.id.slice(0, 8) ?? "-"} />
          <Info label="Status" value={order?.status ?? "-"} />
          <Info label="Pagamento" value={order?.payment_status ?? "-"} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-bold">
            {formatCurrency(order?.total_cents ?? 0)}
          </span>
        </div>
        <Button asChild variant="outline">
          <Link href="/conta/pedidos">Voltar aos pedidos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
