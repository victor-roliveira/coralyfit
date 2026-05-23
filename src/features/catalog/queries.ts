import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockProducts } from "@/features/catalog/mock-products";
import type { CatalogProduct } from "@/features/catalog/types";

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  images: string[];
  categories: { name: string } | null;
  product_variants: Array<{
    id: string;
    size: string;
    color: string;
    color_hex: string | null;
    stock_quantity: number;
    reserved_quantity: number;
  }>;
};

export async function listCatalogProducts(): Promise<CatalogProduct[]> {
  if (!hasSupabaseEnv()) {
    return mockProducts;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,price_cents,images,categories(name),product_variants(id,size,color,color_hex,stock_quantity,reserved_quantity)"
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockProducts;
  }

  return (data as unknown as ProductWithRelations[]).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.price_cents,
    category: product.categories?.name ?? "Sem categoria",
    images: product.images,
    variants: product.product_variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      colorHex: variant.color_hex,
      stockQuantity: variant.stock_quantity,
      reservedQuantity: variant.reserved_quantity
    }))
  }));
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!hasSupabaseEnv()) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,price_cents,images,categories(name),product_variants(id,size,color,color_hex,stock_quantity,reserved_quantity)"
    )
    .eq("active", true)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  const product = data as unknown as ProductWithRelations;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.price_cents,
    category: product.categories?.name ?? "Sem categoria",
    images: product.images,
    variants: product.product_variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      colorHex: variant.color_hex,
      stockQuantity: variant.stock_quantity,
      reservedQuantity: variant.reserved_quantity
    }))
  };
}
