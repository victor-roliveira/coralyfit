import Link from "next/link";
import { BarChart3, Boxes, FolderTree, ShoppingBag, UsersRound } from "lucide-react";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <main className="bg-slate-50">
      <div className="container grid min-h-[calc(100vh-4rem)] gap-6 py-8 lg:grid-cols-[230px_1fr]">
        <AdminSidebar />
        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </main>
  );
}

function AdminSidebar() {
  const items = [
    { label: "Dashboard", href: "/admin", icon: BarChart3 },
    { label: "Produtos", href: "/admin/produtos", icon: Boxes },
    { label: "Categorias", href: "/admin/categorias", icon: FolderTree },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
    { label: "Usuarios", href: "/admin/usuarios", icon: UsersRound }
  ];

  return (
    <aside className="h-fit rounded-lg border bg-white p-3 shadow-sm">
      <p className="px-3 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
        Gestao
      </p>
      <nav className="mt-2 grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-[#B500B2]/10 hover:text-[#B500B2]"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
