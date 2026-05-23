"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/profile/actions";

type ProfileFormProps = {
  fullName: string;
  phone: string;
  email: string;
};

export function ProfileForm({ fullName, phone, email }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, {});

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={phone} placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted-foreground">
          O e-mail vem da sua autenticacao e sera editavel em uma etapa futura.
        </p>
      </div>
      {state.message ? (
        <p className={state.success ? "text-sm text-emerald-700" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} className="rounded-full">
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
