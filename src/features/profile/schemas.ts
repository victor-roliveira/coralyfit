import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: z.string().trim().max(30).optional()
});
