"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import cartIcon from "@/assets/images/icone-cart.svg";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/cart-store";
import type { CatalogProduct, CatalogVariant } from "@/features/catalog/types";
import { FavoriteButton } from "@/features/favorites/favorite-button";

type ProductCardProps = {
  product: CatalogProduct;
  initialFavorited?: boolean;
  onFavoriteChange?: (productId: string, favorited: boolean) => void;
};

export function ProductCard({
  product,
  initialFavorited = false,
  onFavoriteChange
}: ProductCardProps) {
  const availableVariants = product.variants.filter(
    (variant) => variant.stockQuantity - variant.reservedQuantity > 0
  );
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
  const sizes = Array.from(new Set(product.variants.map((variant) => variant.size)));
  const colors = Array.from(
    new Map(product.variants.map((variant) => [variant.color, variant])).values()
  );

  return (
    <article className="group min-w-0 bg-white">
      <div className="relative aspect-[0.74] overflow-hidden bg-slate-100">
        <Link href={`/produtos/${product.slug}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </Link>
        <FavoriteButton
          productId={product.id}
          initialFavorited={initialFavorited}
          onFavoriteChange={(favorited) => onFavoriteChange?.(product.id, favorited)}
          className="absolute right-3 top-3"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-bold text-slate-950">
          <Star className="h-3.5 w-3.5 fill-[#ffb020] text-[#ffb020]" />
          4.9
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center gap-7 bg-white/88 text-sm font-semibold backdrop-blur">
          {sizes.map((size) => (
            <span
              key={size}
              className={cn(
                "text-slate-950",
                product.variants.some(
                  (variant) =>
                    variant.size === size &&
                    variant.stockQuantity - variant.reservedQuantity > 0
                )
                  ? ""
                  : "text-slate-300 line-through"
              )}
            >
              {size}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {product.category}
          </p>
          <Link href={`/produtos/${product.slug}`} className="block">
            <h2 className="mt-1 line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-tight text-slate-950 hover:text-primary">
              {product.name}
            </h2>
          </Link>
          <p className="mt-1 text-2xl font-extrabold text-slate-950">
            {formatCurrency(product.priceCents)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            No PIX com 10% off ou 10x sem juros
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
                "h-7 w-7 rounded-full border-2 border-white shadow-[0_0_0_1px_#cbd5e1] transition-transform hover:scale-105",
                selectedVariant?.color === variant.color && "shadow-[0_0_0_2px_#B500B2]"
              )}
              style={{ backgroundColor: variant.colorHex ?? "#FFFFFF" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {product.variants.slice(0, 6).map((variant) => {
              const inStock = variant.stockQuantity - variant.reservedQuantity > 0;
              const selected = selectedVariantId === variant.id;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!inStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "flex min-h-10 items-center justify-center border px-2 text-center text-sm font-semibold transition-colors focus-ring disabled:cursor-not-allowed disabled:text-slate-300 disabled:line-through",
                    selected
                      ? "border-primary bg-[#f4f5ff] text-primary"
                      : "bg-white hover:border-primary hover:text-primary"
                  )}
                >
                  {variant.size}
                </button>
              );
          })}
        </div>
        <Button
          className="h-11 w-full rounded-full bg-[#B500B2] text-white hover:bg-[#8100D1]"
          disabled={!selectedVariant || availableQuantity <= 0}
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
          Adicionar
        </Button>
      </div>
    </article>
  );
}
