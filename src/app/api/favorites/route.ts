import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const favoriteSchema = z.object({
  productId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ message: "Supabase nao configurado." }, { status: 503 });
  }

  const parsed = favoriteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Produto invalido." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Faca login para favoritar." }, { status: 401 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", parsed.data.productId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ message: "Nao foi possivel verificar favorito." }, { status: 500 });
  }

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);

    if (error) {
      return NextResponse.json({ message: "Nao foi possivel remover favorito." }, { status: 500 });
    }

    return NextResponse.json({ favorited: false });
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    product_id: parsed.data.productId
  });

  if (error) {
    return NextResponse.json({ message: "Nao foi possivel favoritar." }, { status: 500 });
  }

  return NextResponse.json({ favorited: true });
}
