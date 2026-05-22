"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  imageUrl: string | null;
  size: string;
  color: string;
  colorHex: string | null;
  unitPriceCents: number;
  quantity: number;
  availableQuantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? {
                      ...cartItem,
                      quantity: Math.min(
                        cartItem.quantity + 1,
                        cartItem.availableQuantity
                      )
                    }
                  : cartItem
              ),
              isOpen: true
            };
          }

          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId)
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  quantity: Math.max(1, Math.min(quantity, item.availableQuantity))
                }
              : item
          )
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: "coraly-fit-cart",
      partialize: (state) => ({ items: state.items })
    }
  )
);
