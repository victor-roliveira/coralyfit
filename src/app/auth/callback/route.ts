import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = normalizeInternalPath(requestUrl.searchParams.get("next") ?? "");
  let next = requestedNext;

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    if (!next) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        next = profile?.role === "admin" ? "/admin" : "/conta/pedidos";
      }
    }
  }

  return NextResponse.redirect(new URL(next || "/conta/pedidos", request.url));
}

function normalizeInternalPath(path: string) {
  const value = path.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
