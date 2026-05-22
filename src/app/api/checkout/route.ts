import { NextResponse, type NextRequest } from "next/server";

import { createAbacatePayCheckout } from "@/lib/abacatepay";
import { hasSupabaseEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckoutSchema } from "@/features/checkout/schemas";

type OrderItemForPayment = {
  quantity: number;
  products: {
    abacatepay_product_id: string | null;
    name: string;
  } | null;
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde um instante." },
      { status: 429 }
    );
  }

  if (!hasSupabaseEnv() || !process.env.ABACATEPAY_API_KEY) {
    return NextResponse.json(
      { message: "Checkout ainda nao configurado neste ambiente." },
      { status: 503 }
    );
  }

  const payload = createCheckoutSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Carrinho invalido." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Faca login para finalizar a compra." }, { status: 401 });
  }

  const { data: orderId, error: reservationError } = await supabase.rpc("reserve_order_stock", {
    p_items: payload.data.items,
    p_user_id: user.id,
    p_customer_email: user.email ?? null,
    p_customer_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
  });

  if (reservationError || !orderId) {
    return NextResponse.json(
      { message: "Nao foi possivel reservar o estoque dos itens." },
      { status: 409 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: orderItems, error: itemsError } = await admin
    .from("order_items")
    .select("quantity, products(abacatepay_product_id,name)")
    .eq("order_id", orderId);

  if (itemsError || !orderItems) {
    return NextResponse.json(
      { message: "Pedido criado, mas nao foi possivel preparar o pagamento." },
      { status: 500 }
    );
  }

  const checkoutItems = (orderItems as unknown as OrderItemForPayment[]).map((item) => ({
    id: item.products?.abacatepay_product_id,
    quantity: item.quantity,
    name: item.products?.name
  }));

  const missingPaymentProduct = checkoutItems.find((item) => !item.id);
  if (missingPaymentProduct) {
    return NextResponse.json(
      {
        message:
          "Produto sem ID da AbacatePay. Sincronize os produtos antes de habilitar pagamentos reais."
      },
      { status: 422 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const checkout = await createAbacatePayCheckout({
    externalId: orderId,
    returnUrl: `${appUrl}/checkout`,
    completionUrl: `${appUrl}/conta/pedidos/${orderId}`,
    items: checkoutItems.map((item) => ({
      id: item.id!,
      quantity: item.quantity
    }))
  });

  await admin
    .from("orders")
    .update({
      abacatepay_checkout_id: checkout.id,
      abacatepay_checkout_url: checkout.url,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  return NextResponse.json({ orderId, url: checkout.url });
}
