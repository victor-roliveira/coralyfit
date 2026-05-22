import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="container min-h-[calc(100vh-4rem)] py-10">
        <EmptyOrders message="Configure o Supabase para visualizar pedidos reais." />
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,payment_status,total_cents,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Minha conta</p>
          <h1 className="mt-2 text-2xl font-bold">Historico de pedidos</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Comprar mais</Link>
        </Button>
      </div>
      {orders?.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">Pedido {order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short"
                    }).format(new Date(order.created_at))}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold">
                    {order.payment_status}
                  </span>
                  <span className="font-semibold">{formatCurrency(order.total_cents)}</span>
                  <Button asChild size="sm">
                    <Link href={`/conta/pedidos/${order.id}`}>Ver</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyOrders message="Voce ainda nao tem pedidos." />
      )}
    </main>
  );
}

function EmptyOrders({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{message}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/">Ver catalogo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
