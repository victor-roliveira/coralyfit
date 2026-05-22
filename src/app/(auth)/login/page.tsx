import { AuthPanel } from "@/features/auth/auth-panel";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="container grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <AuthPanel next={params.next ?? "/conta/pedidos"} error={params.error} />
    </main>
  );
}
