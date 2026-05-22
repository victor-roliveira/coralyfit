import { listCatalogProducts } from "@/features/catalog/queries";
import {
  CategoryCarousel,
  HeroCarousel,
  ProductCarousel,
  TestimonialsCarousel
} from "@/features/home/home-carousels";

export default async function HomePage() {
  const products = await listCatalogProducts();

  return (
    <main className="bg-white">
      <HeroCarousel />
      <ShippingBar />
      <CategoryCarousel />
      <ProductCarousel id="lancamentos" title="Lancamentos" products={products} />
      <ProductCarousel id="mais-vendidos" title="Mais vendidos" products={products} reverse />
      <TestimonialsCarousel />
    </main>
  );
}

function ShippingBar() {
  return (
    <div className="border-b bg-slate-50 py-3 text-center text-sm font-semibold text-slate-700 md:text-base">
      Frete gratis nas compras acima de R$ 199 e checkout seguro com AbacatePay
    </div>
  );
}
