"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword
} from "@/features/auth/actions";

type AuthPanelProps = {
  next: string;
  error?: string;
};

export function AuthPanel({ next, error }: AuthPanelProps) {
  const [loginState, loginAction, loginPending] = useActionState(signInWithPassword, {});
  const [signupState, signupAction, signupPending] = useActionState(signUpWithPassword, {});
  const [resetState, resetAction, resetPending] = useActionState(sendPasswordReset, {});

  return (
    <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para finalizar compras e acompanhar pedidos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <Button type="submit" variant="outline" className="w-full">
              <LogIn className="h-4 w-4" />
              Entrar com Google
            </Button>
          </form>
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Field label="E-mail" name="email" type="email" autoComplete="email" />
            <Field label="Senha" name="password" type="password" autoComplete="current-password" />
            {loginState.message ? <FormMessage message={loginState.message} /> : null}
            {error ? <FormMessage message="Nao foi possivel concluir o login social." /> : null}
            <Button disabled={loginPending} className="w-full">
              {loginPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <form action={resetAction} className="rounded-lg border bg-muted p-3">
            <Label htmlFor="reset-email">Recuperar senha</Label>
            <div className="mt-2 flex gap-2">
              <Input id="reset-email" name="email" type="email" placeholder="seu@email.com" />
              <Button disabled={resetPending} variant="secondary">
                Enviar
              </Button>
            </div>
            {resetState.message ? (
              <FormMessage message={resetState.message} success={resetState.success} />
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Use e-mail e senha para guardar historico e receber atualizacoes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signupAction} className="space-y-4">
            <Field label="Nome" name="fullName" type="text" autoComplete="name" />
            <Field label="E-mail" name="email" type="email" autoComplete="email" />
            <Field label="Senha" name="password" type="password" autoComplete="new-password" />
            {signupState.message ? (
              <FormMessage message={signupState.message} success={signupState.success} />
            ) : null}
            <Button disabled={signupPending} className="w-full">
              {signupPending ? "Criando..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
};

function Field({ label, name, type, autoComplete }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} autoComplete={autoComplete} required />
    </div>
  );
}

function FormMessage({ message, success }: { message: string; success?: boolean }) {
  return (
    <p className={success ? "text-sm text-emerald-700" : "text-sm text-destructive"}>
      {message}
    </p>
  );
}
