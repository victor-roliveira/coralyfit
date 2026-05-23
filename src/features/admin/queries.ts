import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminProfile = {
  fullName: string | null;
  role: "admin";
};

export type AdminMetric = {
  label: string;
  value: string;
  helper: string;
  tone: "purple" | "blue" | "green" | "amber";
};

export type AdminDashboardData = {
  profile: AdminProfile | null;
  metrics: {
    totalOrders: number;
    paidRevenueCents: number;
    activeProducts: number;
    totalUsers: number;
    pendingOrders: number;
    activeCategories: number;
  };
  recentOrders: AdminRecentOrder[];
  lowStockVariants: AdminLowStockVariant[];
  salesByDay: AdminSalesDay[];
};

export type AdminRecentOrder = {
  id: string;
  customer: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  createdAt: string;
};

export type AdminLowStockVariant = {
  id: string;
  productName: string;
  size: string;
  color: string;
  available: number;
  total: number;
};

export type AdminSalesDay = {
  label: string;
  revenueCents: number;
  orders: number;
};

type RecentOrderRow = {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  status: string;
  payment_status: string;
  total_cents: number;
  created_at: string;
};

type VariantWithProductRow = {
  id: string;
  size: string;
  color: string;
  stock_quantity: number;
  reserved_quantity: number;
  products: { name: string } | null;
};

type PaidOrderRow = {
  id: string;
  total_cents: number;
  paid_at: string | null;
  created_at: string;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!hasSupabaseEnv()) {
    return getMockDashboardData();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [
    ordersResult,
    pendingOrdersResult,
    productsResult,
    usersResult,
    categoriesResult,
    paidOrdersResult,
    recentOrdersResult,
    variantsResult
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("orders")
      .select("id,total_cents,paid_at,created_at")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,customer_email,customer_name,status,payment_status,total_cents,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("product_variants")
      .select("id,size,color,stock_quantity,reserved_quantity,products(name)")
      .eq("active", true)
      .order("stock_quantity", { ascending: true })
      .limit(8)
  ]);

  const paidOrders = (paidOrdersResult.data ?? []) as PaidOrderRow[];
  const recentOrders = ((recentOrdersResult.data ?? []) as RecentOrderRow[]).map(
    (order) => ({
      id: order.id,
      customer: order.customer_name ?? order.customer_email ?? "Cliente sem nome",
      status: order.status,
      paymentStatus: order.payment_status,
      totalCents: order.total_cents,
      createdAt: order.created_at
    })
  );

  const lowStockVariants = ((variantsResult.data ?? []) as unknown as VariantWithProductRow[])
    .map((variant) => ({
      id: variant.id,
      productName: variant.products?.name ?? "Produto sem nome",
      size: variant.size,
      color: variant.color,
      total: variant.stock_quantity,
      available: Math.max(0, variant.stock_quantity - variant.reserved_quantity)
    }))
    .filter((variant) => variant.available <= 5)
    .slice(0, 5);

  return {
    profile: {
      fullName: profile.full_name,
      role: "admin"
    },
    metrics: {
      totalOrders: ordersResult.count ?? 0,
      paidRevenueCents: paidOrders.reduce((sum, order) => sum + order.total_cents, 0),
      activeProducts: productsResult.count ?? 0,
      totalUsers: usersResult.count ?? 0,
      pendingOrders: pendingOrdersResult.count ?? 0,
      activeCategories: categoriesResult.count ?? 0
    },
    recentOrders,
    lowStockVariants,
    salesByDay: buildSalesByDay(paidOrders)
  };
}

function buildSalesByDay(orders: PaidOrderRow[]) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
      revenueCents: 0,
      orders: 0
    };
  });

  const byKey = new Map(days.map((day) => [day.key, day]));

  orders.forEach((order) => {
    const date = new Date(order.paid_at ?? order.created_at);
    const key = date.toISOString().slice(0, 10);
    const day = byKey.get(key);
    if (!day) return;

    day.revenueCents += order.total_cents;
    day.orders += 1;
  });

  return days;
}

function getMockDashboardData(): AdminDashboardData {
  return {
    profile: null,
    metrics: {
      totalOrders: 12,
      paidRevenueCents: 384760,
      activeProducts: 3,
      totalUsers: 8,
      pendingOrders: 2,
      activeCategories: 3
    },
    recentOrders: [
      {
        id: "mock-001",
        customer: "Cliente teste",
        status: "paid",
        paymentStatus: "paid",
        totalCents: 22990,
        createdAt: new Date().toISOString()
      }
    ],
    lowStockVariants: [
      {
        id: "mock-var-001",
        productName: "Conjunto Bloom Move",
        size: "G",
        color: "Coraly",
        available: 3,
        total: 3
      }
    ],
    salesByDay: buildSalesByDay([
      {
        id: "mock-paid-001",
        total_cents: 22990,
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ])
  };
}
