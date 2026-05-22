import { CatalogView } from "@/features/catalog/catalog-view";
import { listCatalogProducts } from "@/features/catalog/queries";
import { Star } from "lucide-react";
import {
  CategoryCarousel,
  HeroCarousel,
  LookCarousel,
  ProductCarousel
} from "@/features/home/home-carousels";

export default async function HomePage() {
  const products = await listCatalogProducts();

  return (
    <main className="bg-white">
      <HeroCarousel />
      <ShippingBar />
      <CategoryCarousel />
      <ProductCarousel id="lancamentos" title="Lancamentos" products={products} />
      <LookCarousel />
      <ProductCarousel id="mais-vendidos" title="Mais vendidos" products={products} reverse />
      <CatalogView products={products} />
      <Testimonials />
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


function Testimonials() {
  const items = [
    ["Maravilhosa, amei", "Atayane T."],
    ["Boa qualidade", "Nivanize R."],
    ["Experiencia maravilhosa.", "Ana B."],
    ["Entrega perfeita, troca perfeita.", "Katia F."],
    ["Voltarei a comprar.", "Paula R."]
  ];

  return (
    <section className="border-t py-14 text-center">
      <h2 className="text-2xl font-semibold text-slate-950">Depoimentos</h2>
      <div className="container mt-12 grid gap-8 md:grid-cols-5">
        {items.map(([quote, author]) => (
          <div key={author} className="space-y-4">
            <div className="flex justify-center gap-0.5 text-[#ffb020]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="font-bold leading-6 text-slate-950">{quote}</p>
            <p className="text-sm text-slate-600">{author}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-slate-950" />
        <span className="h-1.5 w-5 rounded-full bg-slate-300" />
        <span className="h-1.5 w-3 rounded-full bg-slate-200" />
      </div>
    </section>
  );
}
