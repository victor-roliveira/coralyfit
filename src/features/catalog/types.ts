export type CatalogVariant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stockQuantity: number;
  reservedQuantity: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  category: string;
  images: string[];
  variants: CatalogVariant[];
};
