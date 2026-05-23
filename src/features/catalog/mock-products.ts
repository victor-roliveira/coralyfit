import type { CatalogProduct } from "@/features/catalog/types";

export const mockProducts: CatalogProduct[] = [
  {
    id: "mock-legging-aura",
    name: "Legging Aura High",
    slug: "legging-aura-high",
    description:
      "Legging cintura alta com toque macio, compressao equilibrada e bolso interno discreto.",
    priceCents: 14391,
    originalPriceCents: 15990,
    discountPercent: 10,
    isLaunch: true,
    category: "Leggings",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"
    ],
    variants: [
      { id: "mock-legging-p-lav", size: "P", color: "Lavanda", colorHex: "#C9BEFF", stockQuantity: 8, reservedQuantity: 0 },
      { id: "mock-legging-m-lav", size: "M", color: "Lavanda", colorHex: "#C9BEFF", stockQuantity: 12, reservedQuantity: 0 },
      { id: "mock-legging-g-aura", size: "G", color: "Azul Aura", colorHex: "#8494FF", stockQuantity: 7, reservedQuantity: 0 }
    ]
  },
  {
    id: "mock-top-flow",
    name: "Top Flow Support",
    slug: "top-flow-support",
    description:
      "Top com sustentacao media, alcas confortaveis e tecido respiravel para treinos intensos.",
    priceCents: 8990,
    originalPriceCents: 8990,
    discountPercent: 0,
    isLaunch: true,
    category: "Tops",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"
    ],
    variants: [
      { id: "mock-top-p-white", size: "P", color: "Branco", colorHex: "#FFFFFF", stockQuantity: 10, reservedQuantity: 0 },
      { id: "mock-top-m-coraly", size: "M", color: "Coraly", colorHex: "#6367FF", stockQuantity: 9, reservedQuantity: 0 },
      { id: "mock-top-g-coraly", size: "G", color: "Coraly", colorHex: "#6367FF", stockQuantity: 5, reservedQuantity: 0 }
    ]
  },
  {
    id: "mock-set-bloom",
    name: "Conjunto Bloom Move",
    slug: "conjunto-bloom-move",
    description:
      "Conjunto leve com top e short de secagem rapida para musculacao, pilates e corrida.",
    priceCents: 22990,
    originalPriceCents: 22990,
    discountPercent: 0,
    isLaunch: false,
    category: "Conjuntos",
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"
    ],
    variants: [
      { id: "mock-set-p-lav", size: "P", color: "Lavanda", colorHex: "#C9BEFF", stockQuantity: 4, reservedQuantity: 0 },
      { id: "mock-set-m-aura", size: "M", color: "Azul Aura", colorHex: "#8494FF", stockQuantity: 6, reservedQuantity: 0 },
      { id: "mock-set-g-coraly", size: "G", color: "Coraly", colorHex: "#6367FF", stockQuantity: 3, reservedQuantity: 0 }
    ]
  }
];
