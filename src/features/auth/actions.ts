"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resetPasswordSchema, signInSchema, signUpSchema } from "@/features/auth/schemas";

export type AuthActionState = {
  message?: string;
  success?: boolean;
};

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { message: "Configure o Supabase para habilitar login." };
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: "E-mail ou senha incorretos." };
  }

  redirect(await getPostLoginPath(supabase, String(formData.get("next") ?? "")));
}

export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { message: "Configure o Supabase para habilitar cadastro." };
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName
      }
    }
  });

  if (error) {
    return { message: "Nao foi possivel criar sua conta agora." };
  }

  return {
    success: true,
    message: "Conta criada. Confira seu e-mail se a confirmacao estiver ativa."
  };
}

export async function signInWithGoogle(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=supabase");
  }

  const next = normalizeInternalPath(String(formData.get("next") ?? ""));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`
    }
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}

export async function sendPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { message: "Configure o Supabase para habilitar recuperacao." };
  }

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/redefinir-senha`
  });

  if (error) {
    return { message: "Nao foi possivel enviar o e-mail de recuperacao." };
  }

  return { success: true, message: "Enviamos as instrucoes para seu e-mail." };
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}

async function getPostLoginPath(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  requestedNext: string
) {
  const next = normalizeInternalPath(requestedNext);
  if (next) return next;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return "/conta/pedidos";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? "/admin" : "/conta/pedidos";
}

function normalizeInternalPath(path: string) {
  const value = path.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
