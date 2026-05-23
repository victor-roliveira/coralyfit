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
  originalPriceCents?: number;
  discountPercent?: number;
  isLaunch?: boolean;
  category: string;
  images: string[];
  variants: CatalogVariant[];
};
