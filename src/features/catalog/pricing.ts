import type { CatalogProduct } from "@/features/catalog/types";

export function calculateDiscountedPrice(priceCents: number, discountPercent = 0) {
  if (discountPercent <= 0) return priceCents;

  return Math.max(1, Math.round(priceCents * (1 - discountPercent / 100)));
}

export function getProductPricing(product: CatalogProduct) {
  const originalPriceCents = product.originalPriceCents ?? product.priceCents;
  const discountPercent = product.discountPercent ?? 0;
  const finalPriceCents =
    discountPercent > 0
      ? calculateDiscountedPrice(originalPriceCents, discountPercent)
      : product.priceCents;

  return {
    hasDiscount: discountPercent > 0 && finalPriceCents < originalPriceCents,
    discountPercent,
    finalPriceCents,
    originalPriceCents
  };
}
