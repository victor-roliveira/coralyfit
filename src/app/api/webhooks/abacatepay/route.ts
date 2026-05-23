import { NextResponse, type NextRequest } from "next/server";

import { verifyHmacSha256Base64 } from "@/lib/security/hmac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type AbacatePayCheckoutWebhook = {
  id?: string;
  event: string;
  data?: {
    checkout?: {
      id?: string;
      externalId?: string;
      status?: string;
    };
  };
};

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("webhookSecret");

  if (
    !process.env.ABACATEPAY_WEBHOOK_SECRET ||
    secret !== process.env.ABACATEPAY_WEBHOOK_SECRET
  ) {
    console.error("AbacatePay webhook rejected: invalid webhookSecret", {
      hasConfiguredSecret: Boolean(process.env.ABACATEPAY_WEBHOOK_SECRET),
      hasReceivedSecret: Boolean(secret)
    });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  const publicKey = process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY;
  const signature = request.headers.get("x-webhook-signature");

  if (!publicKey) {
    console.error("AbacatePay webhook rejected: missing public key");
    return NextResponse.json({ message: "Webhook public key is not configured" }, { status: 503 });
  }

  if (!verifyHmacSha256Base64({ rawBody, signature, secret: publicKey })) {
    console.error("AbacatePay webhook rejected: invalid signature", {
      hasSignature: Boolean(signature),
      rawBodyLength: rawBody.length
    });
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as AbacatePayCheckoutWebhook;
  const supabase = createSupabaseAdminClient();
  let duplicateProcessed = false;

  if (payload.id) {
    const { error: eventError } = await supabase.from("webhook_events").insert({
      id: payload.id,
      provider: "abacatepay",
      event: payload.event,
      payload
    });

    if (eventError?.code === "23505") {
      const { data: existingEvent } = await supabase
        .from("webhook_events")
        .select("processed_at")
        .eq("id", payload.id)
        .single();

      if (existingEvent?.processed_at) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      duplicateProcessed = true;
    }

    if (eventError && eventError.code !== "23505") {
      console.error("AbacatePay webhook failed: unable to register event", {
        eventId: payload.id,
        event: payload.event,
        code: eventError.code,
        message: eventError.message
      });
      return NextResponse.json({ message: "Unable to register webhook event" }, { status: 500 });
    }
  }

  if (payload.event !== "checkout.completed") {
    return NextResponse.json({ received: true });
  }

  const checkout = payload.data?.checkout;
  const orderId = checkout?.externalId;

  if (!orderId || !checkout?.id || checkout.status !== "PAID") {
    console.error("AbacatePay webhook rejected: invalid checkout payload", {
      event: payload.event,
      checkoutId: checkout?.id,
      orderId,
      status: checkout?.status
    });
    return NextResponse.json({ message: "Invalid checkout payload" }, { status: 400 });
  }

  const { error } = await supabase.rpc("confirm_order_payment", {
    p_order_id: orderId,
    p_checkout_id: checkout.id,
    p_payload: payload
  });

  if (error) {
    console.error("AbacatePay webhook failed: unable to confirm order", {
      eventId: payload.id,
      checkoutId: checkout.id,
      orderId,
      code: error.code,
      message: error.message
    });
    return NextResponse.json({ message: "Unable to confirm order" }, { status: 500 });
  }

  if (payload.id) {
    await supabase
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", payload.id);
  }

  return NextResponse.json({ received: true, retried: duplicateProcessed });
}
