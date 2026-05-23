import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/conta/perfil", label: "Perfil" },
  { href: "/conta/favoritos", label: "Favoritos" },
  { href: "/conta/pedidos", label: "Pedidos" }
];

export function AccountNav() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <LogoutButton compact />
    </div>
  );
}
