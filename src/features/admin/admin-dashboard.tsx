import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  FolderTree,
  PackagePlus,
  ShoppingBag,
  Truck,
  UsersRound
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { formatCurrency } from "@/lib/formatters";
import { AdminShell } from "@/features/admin/admin-shell";
import type { AdminDashboardData } from "@/features/admin/queries";

type AdminDashboardProps = {
  data: AdminDashboardData;
};

const statusLabels: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em preparo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  pending: "Pendente",
  failed: "Falhou",
  expired: "Expirado",
  disputed: "Em disputa"
};

export function AdminDashboard({ data }: AdminDashboardProps) {
  const maxSales = Math.max(...data.salesByDay.map((day) => day.revenueCents), 1);

  return (
    <AdminShell>
          <header className="flex flex-col justify-between gap-4 rounded-lg border bg-white p-5 shadow-sm md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#B500B2]">
                Admin Coraly Fit
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#462C7D] md:text-3xl">
                Visao geral da loja
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {data.profile?.fullName
                  ? `Logado como ${data.profile.fullName}`
                  : "Ambiente de teste com dados demonstrativos"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <LogoutButton compact />
              <Link
                href="/admin/produtos/novo"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#B500B2] px-5 text-sm font-bold text-white transition-colors hover:bg-[#8100D1]"
              >
                <PackagePlus className="h-4 w-4" />
                Novo produto
              </Link>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={ShoppingBag}
              label="Pedidos"
              value={String(data.metrics.totalOrders)}
              helper={`${data.metrics.pendingOrders} pendentes`}
            />
            <MetricCard
              icon={BarChart3}
              label="Vendas pagas"
              value={formatCurrency(data.metrics.paidRevenueCents)}
              helper="Receita confirmada"
            />
            <MetricCard
              icon={Boxes}
              label="Produtos ativos"
              value={String(data.metrics.activeProducts)}
              helper={`${data.metrics.activeCategories} categorias ativas`}
            />
            <MetricCard
              icon={UsersRound}
              label="Usuarios"
              value={String(data.metrics.totalUsers)}
              helper="Contas cadastradas"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#462C7D]">Vendas dos ultimos 7 dias</CardTitle>
                <CardDescription>Pedidos com pagamento confirmado.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-56 items-end gap-3">
                  {data.salesByDay.map((day) => (
                    <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-40 w-full items-end rounded-md bg-slate-100 p-1">
                        <div
                          className="w-full rounded bg-[#B500B2]"
                          style={{
                            height: `${Math.max(8, (day.revenueCents / maxSales) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{day.label}</span>
                      <span className="text-xs text-slate-400">{day.orders} ped.</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#462C7D]">Estoque em atencao</CardTitle>
                <CardDescription>Variacoes com 5 unidades ou menos.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.lowStockVariants.length ? (
                  <div className="space-y-3">
                    {data.lowStockVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{variant.productName}</p>
                          <p className="text-xs text-slate-500">
                            {variant.size} / {variant.color}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#B500B2]/10 px-3 py-1 text-xs font-bold text-[#B500B2]">
                          {variant.available === 0
                            ? "Reposicao urgente"
                            : `${variant.available}/${variant.total}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Nenhuma variacao com estoque baixo." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.82fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#462C7D]">Pedidos recentes</CardTitle>
                <CardDescription>Ultimas compras criadas no checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentOrders.length ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="grid grid-cols-[1fr_120px_130px] gap-3 bg-slate-100 px-4 py-3 text-xs font-bold uppercase text-slate-500 md:grid-cols-[1fr_140px_140px_120px]">
                      <span>Cliente</span>
                      <span>Status</span>
                      <span className="hidden md:block">Pagamento</span>
                      <span className="text-right">Total</span>
                    </div>
                    {data.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-[1fr_120px_130px] items-center gap-3 border-t px-4 py-3 text-sm md:grid-cols-[1fr_140px_140px_120px]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{order.customer}</p>
                          <p className="text-xs text-slate-400">{shortId(order.id)}</p>
                        </div>
                        <StatusPill status={order.status} />
                        <span className="hidden text-sm text-slate-500 md:block">
                          {statusLabels[order.paymentStatus] ?? order.paymentStatus}
                        </span>
                        <span className="text-right font-bold">
                          {formatCurrency(order.totalCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Nenhum pedido criado ainda." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#462C7D]">Proximas areas</CardTitle>
                <CardDescription>Ordem sugerida para evoluir o painel.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ActionCard
                  icon={Boxes}
                  title="Produtos"
                  description="Listagem, cadastro, variacoes e imagens."
                  href="/admin/produtos"
                />
                <ActionCard
                  icon={FolderTree}
                  title="Categorias"
                  description="Organizacao dos filtros e colecoes."
                  href="/admin/categorias"
                />
                <ActionCard
                  icon={Truck}
                  title="Pedidos"
                  description="Pagamento, preparo, envio e historico."
                  href="/admin/pedidos"
                />
                <ActionCard
                  icon={AlertTriangle}
                  title="Alertas"
                  description="Estoque baixo e eventos de webhook."
                  href="/admin/alertas"
                />
              </CardContent>
            </Card>
          </div>
    </AdminShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#B500B2]/10">
          <Icon className="h-5 w-5 text-[#B500B2]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="truncate text-2xl font-black text-[#462C7D]">{value}</p>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const paid = status === "paid" || status === "delivered" || status === "shipped";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
        paid ? "bg-emerald-50 text-emerald-700" : "bg-[#B500B2]/10 text-[#B500B2]"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href
}: {
  icon: typeof Boxes;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:border-[#B500B2] hover:bg-[#B500B2]/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#B500B2]/10">
        <Icon className="h-4 w-4 text-[#B500B2]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#462C7D]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function shortId(id: string) {
  return id.slice(0, 8);
}
