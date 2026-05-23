"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import cartIcon from "@/assets/images/icone-cart.svg";
import searchIcon from "@/assets/images/icone-pesquisa.svg";
import userIcon from "@/assets/images/icone-usuario.svg";
import logoCoraly from "@/assets/images/logo-coraly.png";
import { mockProducts } from "@/features/catalog/mock-products";
import { useCatalogSearchStore } from "@/features/catalog/search-store";
import { useCartStore } from "@/features/cart/cart-store";

const menuGroups = [
  {
    title: "Destaques",
    links: ["Mais vendidos", "Lancamentos", "Conjuntos", "Compre o look"]
  },
  {
    title: "Produtos",
    links: ["Calcas e leggings", "Tops", "Shorts", "Macacoes", "Blusas e regatas"]
  },
  {
    title: "Acessorios",
    links: ["Bolsas", "Garrafinhas", "Meias", "Munhequeiras"]
  },
  {
    title: "Colecoes",
    links: ["Aura", "Fit Basic", "Bloom", "Seamless"]
  }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const query = useCatalogSearchStore((state) => state.query);
  const setQuery = useCatalogSearchStore((state) => state.setQuery);
  const itemsCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const openCart = useCartStore((state) => state.openCart);
  const searchResults =
    query.trim().length > 0
      ? mockProducts.filter((product) => {
          const value = `${product.name} ${product.category} ${product.description}`.toLowerCase();
          return value.includes(query.trim().toLowerCase());
        })
      : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="hidden h-9 items-center justify-center border-b bg-slate-100 text-sm font-medium text-slate-700 md:flex">
        Frete gratis acima de R$ 199 e compre em ate 10x sem juros
      </div>
      <div className="container relative flex min-h-16 items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4 lg:min-w-[390px]">
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-7 w-7" />}
          </Button>
          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-800 lg:flex">
            <Link href="/#lancamentos" className="hover:text-primary">
              Lancamentos
            </Link>
            <Link href="/#mais-vendidos" className="hover:text-primary">
              Mais vendidos
            </Link>
            <Link href="/#catalogo" className="underline underline-offset-4 hover:text-primary">
              Sale
            </Link>
          </nav>
        </div>
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
          aria-label="Coraly Fit"
        >
          <span className="relative block h-12 w-44 md:h-14 md:w-56">
            <Image
              src={logoCoraly}
              alt="Coraly Fit"
              fill
              priority
              sizes="(min-width: 768px) 256px, 192px"
              className="object-contain object-center"
            />
          </span>
        </Link>
        <div className="flex items-center justify-end gap-2 lg:min-w-[390px]">
          <label className="relative hidden w-full max-w-[360px] md:block">
            <span className="sr-only">Buscar produtos</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 140)}
              placeholder="O que voce procura?"
              className="h-12 rounded-none border-0 bg-slate-100 pl-5 pr-11"
            />
            <Image
              src={searchIcon}
              alt=""
              className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2"
            />
            {searchFocused && query.trim().length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 border bg-white p-2 shadow-xl">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produtos/${product.slug}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-950">{product.name}</span>
                      <span className="text-xs uppercase text-slate-400">{product.category}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Nenhum item encontrado.
                  </p>
                )}
              </div>
            ) : null}
          </label>
          <Button asChild variant="ghost" size="icon" aria-label="Minha conta">
            <Link href="/conta/perfil">
              <Image src={userIcon} alt="" className="h-6 w-6" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir carrinho"
            onClick={openCart}
            className="relative"
          >
            <Image src={cartIcon} alt="" className="h-6 w-6" />
            {itemsCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                {itemsCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
      {menuOpen ? (
        <div className="absolute inset-x-0 top-full z-50 border-t bg-[#4A3A63] text-white shadow-2xl">
          <div className="container grid gap-10 py-12 md:grid-cols-4">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-lg font-extrabold">{group.title}</h2>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/#catalogo"
                        onClick={() => setMenuOpen(false)}
                        className="text-base font-medium text-white/90 hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
