import { mockProducts } from "@/features/catalog/mock-products";
import { requireAdmin } from "@/features/admin/auth";

export type AdminCategoryOption = {
  id: string;
  name: string;
};

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceCents: number;
  images: string[];
  active: boolean;
  variantsCount: number;
  stockTotal: number;
  reservedTotal: number;
  createdAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  images: string[];
  active: boolean;
  created_at: string;
  categories: { name: string } | null;
  product_variants: Array<{
    id: string;
    stock_quantity: number;
    reserved_quantity: number;
  }>;
};

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const { supabase } = await requireAdmin();

  if (!supabase) {
    return mockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      priceCents: product.priceCents,
      images: product.images,
      active: true,
      variantsCount: product.variants.length,
      stockTotal: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
      reservedTotal: product.variants.reduce((sum, variant) => sum + variant.reservedQuantity, 0),
      createdAt: new Date().toISOString()
    }));
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,price_cents,images,active,created_at,categories(name),product_variants(id,stock_quantity,reserved_quantity)"
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return ((data ?? []) as unknown as ProductRow[]).map((product) => {
    const variants = product.product_variants ?? [];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.categories?.name ?? "Sem categoria",
      priceCents: product.price_cents,
      images: product.images,
      active: product.active,
      variantsCount: variants.length,
      stockTotal: variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
      reservedTotal: variants.reduce((sum, variant) => sum + variant.reserved_quantity, 0),
      createdAt: product.created_at
    };
  });
}

export async function listAdminCategoryOptions(): Promise<AdminCategoryOption[]> {
  const { supabase } = await requireAdmin();

  if (!supabase) {
    return [
      { id: "mock-leggings", name: "Leggings" },
      { id: "mock-tops", name: "Tops" },
      { id: "mock-conjuntos", name: "Conjuntos" }
    ];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}
