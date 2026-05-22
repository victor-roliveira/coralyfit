"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/cart-store";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const total = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  return (
    <>
      <button
        aria-label="Fechar carrinho"
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/30 opacity-0 transition-opacity",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none"
        )}
        onClick={closeCart}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md translate-x-full flex-col bg-white shadow-2xl transition-transform",
          isOpen && "translate-x-0"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Carrinho
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Seu carrinho esta vazio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha tamanho e cor para adicionar uma peca.
              </p>
            </div>
            <Button onClick={closeCart}>Ver produtos</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div key={item.variantId} className="grid grid-cols-[76px_1fr] gap-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={152}
                        height={192}
                        className="h-24 w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate font-semibold">{item.productName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.size} / {item.color}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex h-9 items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.unitPriceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <Separator className="my-4" />
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout" onClick={closeCart}>
                  Finalizar compra
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                O estoque sera validado e reservado no checkout.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
