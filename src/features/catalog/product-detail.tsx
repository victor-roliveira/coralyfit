"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Ruler, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import cartIcon from "@/assets/images/icone-cart.svg";
import { useCartStore } from "@/features/cart/cart-store";
import type { CatalogProduct, CatalogVariant } from "@/features/catalog/types";
import { FavoriteButton } from "@/features/favorites/favorite-button";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const availableVariants = product.variants.filter(
    (variant) => variant.stockQuantity - variant.reservedQuantity > 0
  );
  const isSoldOut = availableVariants.length === 0;
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? product.variants[0]?.id
  );
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = useMemo<CatalogVariant | undefined>(
    () => product.variants.find((variant) => variant.id === selectedVariantId),
    [product.variants, selectedVariantId]
  );
  const availableQuantity = selectedVariant
    ? selectedVariant.stockQuantity - selectedVariant.reservedQuantity
    : 0;
  const colors = Array.from(
    new Map(product.variants.map((variant) => [variant.color, variant])).values()
  );

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-8">
      <Button asChild variant="ghost" className="mb-5">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="grid gap-3 md:grid-cols-[90px_1fr]">
          <div className="hidden space-y-3 md:block">
            {(product.images.length ? product.images : [product.images[0]]).slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-[0.72] overflow-hidden border bg-slate-100">
                <Image src={image} alt={product.name} fill sizes="90px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="relative aspect-[0.78] overflow-hidden bg-slate-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className={cn("object-cover", isSoldOut && "opacity-45 grayscale")}
            />
          </div>
          {isSoldOut ? (
            <p className="text-center text-sm font-black uppercase tracking-[0.22em] text-[#462C7D]">
              Sold out
            </p>
          ) : null}
        </section>

        <aside className="lg:pt-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-400">{product.category}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950">
                {product.name}
              </h1>
            </div>
            <FavoriteButton productId={product.id} />
          </div>
          <p className="text-3xl font-black text-slate-950">
            {formatCurrency(product.priceCents)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            No PIX com 10% off ou 10x sem juros
          </p>
          <p className="mt-6 leading-7 text-slate-700">{product.description}</p>

          <div className="mt-7 space-y-3">
            <p className="font-semibold">Cor: {selectedVariant?.color ?? "-"}</p>
            <div className="flex flex-wrap gap-3">
              {colors.map((variant) => (
                <button
                  key={variant.color}
                  type="button"
                  onClick={() => {
                    const nextVariant = product.variants.find(
                      (item) => item.color === variant.color
                    );
                    if (nextVariant) setSelectedVariantId(nextVariant.id);
                  }}
                  aria-label={`Selecionar cor ${variant.color}`}
                  className={cn(
                    "h-11 w-11 rounded-full border-4 border-white shadow-[0_0_0_1px_#cbd5e1]",
                    selectedVariant?.color === variant.color && "shadow-[0_0_0_2px_#B500B2]"
                  )}
                  style={{ backgroundColor: variant.colorHex ?? "#FFFFFF" }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <p className="font-semibold">Tamanho</p>
            <div className="grid grid-cols-4 gap-3">
              {product.variants.map((variant) => {
                const inStock = variant.stockQuantity - variant.reservedQuantity > 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!inStock}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      "h-12 border text-sm font-semibold transition-colors disabled:text-slate-300 disabled:line-through",
                      selectedVariantId === variant.id
                        ? "border-primary bg-[#f4f5ff] text-primary"
                        : "hover:border-primary hover:text-primary"
                    )}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Tabela de medidas
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Compra segura
            </span>
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 w-full rounded-full bg-[#B500B2] text-base font-black uppercase hover:bg-[#8100D1]"
            disabled={isSoldOut || !selectedVariant || availableQuantity <= 0}
            onClick={() => {
              if (!selectedVariant) return;
              addItem({
                variantId: selectedVariant.id,
                productId: product.id,
                productName: product.name,
                slug: product.slug,
                imageUrl: product.images[0] ?? null,
                size: selectedVariant.size,
                color: selectedVariant.color,
                colorHex: selectedVariant.colorHex,
                unitPriceCents: product.priceCents,
                availableQuantity
              });
            }}
          >
            <Image src={cartIcon} alt="" className="h-5 w-5 brightness-0 invert" />
            Adicionar ao carrinho
          </Button>
        </aside>
      </div>
    </main>
  );
}
