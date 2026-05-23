"use server";

import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/profile/schemas";

export type ProfileActionState = {
  message?: string;
  success?: boolean;
};

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  if (!hasSupabaseEnv()) {
    return { message: "Configure o Supabase para editar seu perfil." };
  }

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Faca login para atualizar seu perfil." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    return { message: "Nao foi possivel atualizar seu perfil." };
  }

  revalidatePath("/conta/perfil");
  return { success: true, message: "Perfil atualizado." };
}
