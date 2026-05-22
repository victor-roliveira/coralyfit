"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { useCartStore } from "@/features/cart/cart-store";

export function CheckoutClient() {
  const { items, clearCart } = useCartStore();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const total = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  async function createCheckout() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      })
    });

    const payload = (await response.json()) as { url?: string; message?: string };

    if (!response.ok || !payload.url) {
      setMessage(payload.message ?? "Nao foi possivel iniciar o checkout.");
      setLoading(false);
      return;
    }

    clearCart();
    window.location.href = payload.url;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_360px]">
      <section>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Continuar comprando
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Resumo da compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {items.length === 0 ? (
              <div className="rounded-lg bg-muted p-8 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 font-semibold">Seu carrinho esta vazio</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={144}
                        height={192}
                        className="h-24 w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.size} / {item.color} - {item.quantity} un.
                    </p>
                    <p className="mt-2 font-semibold">
                      {formatCurrency(item.unitPriceCents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <aside>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Pagamento seguro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <Separator className="my-4" />
            {message ? <p className="mb-3 text-sm text-destructive">{message}</p> : null}
            <Button
              className="w-full"
              size="lg"
              disabled={items.length === 0 || loading}
              onClick={createCheckout}
            >
              {loading ? "Preparando..." : "Ir para AbacatePay"}
            </Button>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              A reserva de estoque acontece antes do redirecionamento e o estoque definitivo
              so baixa apos webhook aprovado.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
