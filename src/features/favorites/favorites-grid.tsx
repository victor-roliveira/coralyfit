"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProduct } from "@/features/catalog/types";

type FavoritesGridProps = {
  products: CatalogProduct[];
};

export function FavoritesGrid({ products: initialProducts }: FavoritesGridProps) {
  const [products, setProducts] = useState(initialProducts);

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-muted p-10 text-center">
        <p className="font-semibold">Voce ainda nao tem favoritos visiveis.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          initialFavorited
          onFavoriteChange={(productId, favorited) => {
            if (!favorited) {
              setProducts((current) => current.filter((item) => item.id !== productId));
            }
          }}
        />
      ))}
    </div>
  );
}
