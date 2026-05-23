import { AdminShell } from "@/features/admin/admin-shell";
import { ProductList } from "@/features/admin/product-list";
import { listAdminProducts } from "@/features/admin/product-queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <AdminShell>
      <header className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#B500B2]">
          Catalogo
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#462C7D] md:text-3xl">
          Gestao de produtos
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Crie produtos, acompanhe estoque e controle o que aparece na loja.
        </p>
      </header>
      <ProductList products={products} />
    </AdminShell>
  );
}
