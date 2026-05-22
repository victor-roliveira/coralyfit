import { BarChart3, Boxes, ShoppingBag, UsersRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/formatters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const metrics = await getAdminMetrics();

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <div className="mb-7">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Dashboard Coraly Fit</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={ShoppingBag} label="Pedidos" value={String(metrics.orders)} />
        <MetricCard icon={BarChart3} label="Vendas pagas" value={formatCurrency(metrics.revenue)} />
        <MetricCard icon={Boxes} label="Produtos ativos" value={String(metrics.products)} />
        <MetricCard icon={UsersRound} label="Usuarios" value={String(metrics.users)} />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <AdminAction title="Produtos" description="Cadastro, edicao, imagens, variacoes e status." />
        <AdminAction title="Pedidos" description="Acompanhe pagamentos, preparo e envio." />
        <AdminAction title="Categorias" description="Organize filtros e navegacao da loja." />
      </section>
    </main>
  );
}

async function getAdminMetrics() {
  if (!hasSupabaseEnv()) {
    return { orders: 0, revenue: 0, products: 3, users: 0 };
  }

  const supabase = await createSupabaseServerClient();
  const [{ count: orders }, { count: products }, { count: users }, { data: paidOrders }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_cents").eq("payment_status", "paid")
    ]);

  return {
    orders: orders ?? 0,
    products: products ?? 0,
    users: users ?? 0,
    revenue: paidOrders?.reduce((sum, order) => sum + order.total_cents, 0) ?? 0
  };
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminAction({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
