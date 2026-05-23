import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/profile-form";

export default async function ProfilePage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="container min-h-[calc(100vh-4rem)] py-10">
        <AccountNav />
        <Card>
          <CardHeader>
            <CardTitle>Perfil indisponivel</CardTitle>
          </CardHeader>
          <CardContent>Configure o Supabase para editar seu perfil.</CardContent>
        </Card>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta/perfil");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone")
    .eq("id", user.id)
    .single();

  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <AccountNav />
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Meus dados</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
            email={user.email ?? ""}
          />
        </CardContent>
      </Card>
    </main>
  );
}
