import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account-nav";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogProduct } from "@/features/catalog/types";
import { FavoritesGrid } from "@/features/favorites/favorites-grid";

type FavoriteWithProduct = {
  products: {
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
  } | null;
};

export default async function FavoritesPage() {
  if (!hasSupabaseEnv()) {
    return <EmptyFavorites message="Configure o Supabase para guardar favoritos." />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta/favoritos");
  }

  const { data } = await supabase
    .from("favorites")
    .select(
      "products(id,name,slug,description,price_cents,images,categories(name),product_variants(id,size,color,color_hex,stock_quantity,reserved_quantity))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = ((data ?? []) as unknown as FavoriteWithProduct[])
    .map((favorite) => favorite.products)
    .filter(Boolean)
    .map((product): CatalogProduct => ({
      id: product!.id,
      name: product!.name,
      slug: product!.slug,
      description: product!.description,
      priceCents: product!.price_cents,
      images: product!.images,
      category: product!.categories?.name ?? "Sem categoria",
      variants: product!.product_variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        colorHex: variant.color_hex,
        stockQuantity: variant.stock_quantity,
        reservedQuantity: variant.reserved_quantity
      }))
    }));

  if (products.length === 0) {
    return <EmptyFavorites message="Voce ainda nao favoritou nenhum produto." />;
  }

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <AccountNav />
      <div className="mb-7">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary">
          Minha conta
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase text-slate-950">
          Favoritos
        </h1>
      </div>
      <FavoritesGrid products={products} />
    </main>
  );
}

function EmptyFavorites({ message }: { message: string }) {
  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <AccountNav />
      <div className="rounded-lg border bg-muted p-10 text-center">
        <p className="font-semibold">{message}</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/">Ver produtos</Link>
        </Button>
      </div>
    </main>
  );
}
