import Link from "next/link";

const links = [
  { href: "/conta/perfil", label: "Perfil" },
  { href: "/conta/favoritos", label: "Favoritos" },
  { href: "/conta/pedidos", label: "Pedidos" }
];

export function AccountNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
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
  );
}
