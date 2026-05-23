import { AdminShell } from "@/features/admin/admin-shell";
import { ProductForm } from "@/features/admin/product-form";
import { listAdminCategoryOptions } from "@/features/admin/product-queries";

export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const categories = await listAdminCategoryOptions();

  return (
    <AdminShell>
      <header className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#B500B2]">
          Novo produto
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#462C7D] md:text-3xl">
          Cadastro de produto
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Preencha os dados principais e as variacoes iniciais de estoque.
        </p>
      </header>
      <ProductForm categories={categories} />
    </AdminShell>
  );
}
