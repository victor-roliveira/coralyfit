import { notFound } from "next/navigation";

import { getCatalogProductBySlug } from "@/features/catalog/queries";
import { ProductDetail } from "@/features/catalog/product-detail";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
