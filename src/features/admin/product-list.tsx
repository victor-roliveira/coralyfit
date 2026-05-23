import Image from "next/image";
import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { toggleProductStatus } from "@/features/admin/product-actions";
import type { AdminProductListItem } from "@/features/admin/product-queries";

type ProductListProps = {
  products: AdminProductListItem[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-[#462C7D]">Produtos</CardTitle>
          <CardDescription>Controle catalogo, estoque e visibilidade na loja.</CardDescription>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/produtos/novo">
            <PackagePlus className="h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {products.length ? (
          <div className="overflow-hidden rounded-md border">
            <div className="grid grid-cols-[1.4fr_120px_120px_120px] gap-3 bg-slate-100 px-4 py-3 text-xs font-bold uppercase text-slate-500 lg:grid-cols-[1.5fr_150px_120px_120px_120px]">
              <span>Produto</span>
              <span className="hidden lg:block">Categoria</span>
              <span>Estoque</span>
              <span>Status</span>
              <span className="text-right">Acao</span>
            </div>
            {products.map((product) => {
              const available = Math.max(0, product.stockTotal - product.reservedTotal);

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[1.4fr_120px_120px_120px] items-center gap-3 border-t px-4 py-3 text-sm lg:grid-cols-[1.5fr_150px_120px_120px_120px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-slate-100">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#462C7D]">{product.name}</p>
                      <p className="truncate text-xs text-slate-500">{product.slug}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {formatCurrency(product.priceCents)}
                      </p>
                    </div>
                  </div>
                  <span className="hidden text-slate-600 lg:block">{product.category}</span>
                  <div>
                    <p className="font-bold">{available}</p>
                    <p className="text-xs text-slate-400">
                      {product.variantsCount} variacao{product.variantsCount === 1 ? "" : "es"}
                    </p>
                    {available === 0 ? (
                      <p className="mt-1 w-fit rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700">
                        Esgotado
                      </p>
                    ) : null}
                  </div>
                  <StatusPill active={product.active} />
                  <form action={toggleProductStatus} className="flex justify-end">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="active" value={String(!product.active)} />
                    <button
                      type="submit"
                      className="rounded-full border border-[#B500B2] px-3 py-1.5 text-xs font-bold text-[#B500B2] transition-colors hover:border-[#8100D1] hover:text-[#8100D1]"
                    >
                      {product.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="font-semibold text-[#462C7D]">Nenhum produto cadastrado.</p>
            <p className="mt-1 text-sm text-slate-500">
              Cadastre o primeiro produto para liberar a loja.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/admin/produtos/novo">Cadastrar produto</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}
