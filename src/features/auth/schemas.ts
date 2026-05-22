import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.")
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Informe seu nome.")
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail valido.")
});
