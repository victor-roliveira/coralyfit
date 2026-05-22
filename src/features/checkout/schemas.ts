import { z } from "zod";

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid("Variacao invalida."),
  quantity: z.coerce.number().int().min(1).max(20)
});

export const createCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Carrinho vazio.")
});
