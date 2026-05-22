"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/features/catalog/product-card";
import { useCatalogSearchStore } from "@/features/catalog/search-store";
import type { CatalogProduct } from "@/features/catalog/types";

type CatalogViewProps = {
  products: CatalogProduct[];
};

export function CatalogView({ products }: CatalogViewProps) {
  const [category, setCategory] = useState("Todos");
  const [size, setSize] = useState("Todos");
  const [color, setColor] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState("");
  const query = useCatalogSearchStore((state) => state.query);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );
  const sizes = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(products.flatMap((product) => product.variants.map((variant) => variant.size)))
      )
    ],
    [products]
  );
  const colors = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(products.flatMap((product) => product.variants.map((variant) => variant.color)))
      )
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const maxPriceCents = maxPrice ? Number(maxPrice) * 100 : null;

    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesSize =
        size === "Todos" || product.variants.some((variant) => variant.size === size);
      const matchesColor =
        color === "Todos" || product.variants.some((variant) => variant.color === color);
      const matchesPrice = !maxPriceCents || product.priceCents <= maxPriceCents;
      const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      const matchesQuery =
        query.trim().length === 0 || searchable.includes(query.trim().toLowerCase());

      return matchesCategory && matchesSize && matchesColor && matchesPrice && matchesQuery;
    });
  }, [category, color, maxPrice, products, query, size]);

  const resetFilters = () => {
    setCategory("Todos");
    setSize("Todos");
    setColor("Todos");
    setMaxPrice("");
  };

  return (
    <section id="catalogo" className="container border-t py-10 md:py-14">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary">
            Sale
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-slate-950 md:text-3xl">
            Todos os produtos
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          {filteredProducts.length} produto(s)
        </div>
      </div>

      <div className="mb-8 grid gap-3 border-y bg-slate-50 py-4 md:grid-cols-[1fr_1fr_1fr_160px_auto]">
        <FilterGroup label="Categoria" options={categories} value={category} onChange={setCategory} />
        <FilterGroup label="Tamanho" options={sizes} value={size} onChange={setSize} />
        <FilterGroup label="Cor" options={colors} value={color} onChange={setColor} />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Ate R$
          </span>
          <Input
            inputMode="numeric"
            value={maxPrice}
            placeholder="250"
            onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))}
          />
        </label>
        <Button variant="outline" className="self-end rounded-full" onClick={resetFilters}>
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted p-10 text-center">
          <p className="font-semibold">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste os filtros para encontrar outras pecas.
          </p>
        </div>
      )}
    </section>
  );
}

type FilterGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <select
        className="h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
