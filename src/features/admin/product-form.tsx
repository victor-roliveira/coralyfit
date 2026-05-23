"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import imageAdd from "@/assets/images/icone-image-add.svg";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/features/admin/product-actions";
import type { AdminCategoryOption } from "@/features/admin/product-queries";

type ProductFormProps = {
  categories: AdminCategoryOption[];
};

type VariantDraft = {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
};

type ImageDraft = {
  id: string;
  file: File;
  preview: string;
};

const sizeOptions = ["PP", "P", "M", "G", "GG", "XG"];

function createVariant(): VariantDraft {
  return {
    id: crypto.randomUUID(),
    size: "P",
    color: "Lavanda",
    colorHex: "#C9BEFF",
    sku: "",
    stockQuantity: 0
  };
}

export function ProductForm({ categories }: ProductFormProps) {
  const [state, action, pending] = useActionState(createProduct, {});
  const [variants, setVariants] = useState<VariantDraft[]>([createVariant()]);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageDraft[]>([]);

  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const variantsJson = useMemo(
    () =>
      JSON.stringify(
        variants.map(({ size, color, colorHex, sku, stockQuantity }) => ({
          size,
          color,
          colorHex,
          sku,
          stockQuantity
        }))
      ),
    [variants]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    images.forEach((image) => dataTransfer.items.add(image.file));
    input.files = dataTransfer.files;
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  function updateVariant(id: string, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant))
    );
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.length === 1 ? current : current.filter((variant) => variant.id !== id)
    );
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length === 0) return;

    setImages((current) => {
      const remainingSlots = Math.max(0, 8 - current.length);
      const additions = nextFiles.slice(0, remainingSlots).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file)
      }));

      return [...current, ...additions];
    });

    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);

      return current.filter((image) => image.id !== id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#462C7D]">Cadastrar produto</CardTitle>
        <CardDescription>
          Envie imagens, defina categoria, preco e estoque por variacao. O banco guarda
          somente as URLs finais do Supabase Storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-6">
          <input type="hidden" name="variantsJson" value={variantsJson} />

          <section className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" name="name" placeholder="Conjunto Aura Move" required />
            <Field label="Slug" name="slug" placeholder="conjunto-aura-move" />
          </section>

          <section className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-[#B500B2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B500B2]/25"
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Preco" name="price" placeholder="229,90" required />
          </section>

          <section className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Descreva tecido, modelagem, uso recomendado e diferenciais."
            />
          </section>

          <section className="space-y-3">
            <div>
              <Label htmlFor="images">Imagens do produto</Label>
              <p className="mt-1 text-xs text-slate-500">
                Envie ate 8 imagens JPG, PNG, WebP ou AVIF. Cada imagem pode ter ate 10 MB.
              </p>
            </div>
            <label
              htmlFor="images"
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#B500B2]/50 bg-[#B500B2]/5 px-4 py-8 text-center transition-colors hover:bg-[#B500B2]/10"
            >
              <Image
                src={imageAdd}
                alt=""
                className="h-8 w-8 object-contain"
              />
              <span className="mt-3 text-sm font-bold text-[#462C7D]">
                {images.length ? "Adicionar mais imagens" : "Selecionar imagens"}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                {images.length}/8 imagens selecionadas
              </span>
              <input
                ref={inputRef}
                id="images"
                name="images"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                required
                onChange={handleImagesChange}
                className="sr-only"
              />
            </label>
            {images.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-[0.78] overflow-hidden rounded-md border bg-slate-100"
                  >
                    <Image
                      src={image.preview}
                      alt={`Previa ${index + 1}`}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remover imagem ${index + 1}`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#B500B2] shadow-sm transition-colors hover:text-[#8100D1]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-black text-[#462C7D]">Variacoes e estoque</h2>
                <p className="text-sm text-slate-500">
                  Cada linha representa uma combinacao de tamanho e cor. Estoque total:{" "}
                  <strong>{totalStock}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariants((current) => [...current, createVariant()])}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#B500B2] px-4 text-sm font-bold text-[#B500B2] transition-colors hover:border-[#8100D1] hover:text-[#8100D1]"
              >
                <Plus className="h-4 w-4" />
                Adicionar variacao
              </button>
            </div>

            <div className="grid gap-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[110px_1fr_92px_1fr_120px_40px]"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`size-${variant.id}`}>Tamanho</Label>
                    <select
                      id={`size-${variant.id}`}
                      value={variant.size}
                      onChange={(event) => updateVariant(variant.id, { size: event.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:border-[#B500B2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B500B2]/25"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`color-${variant.id}`}>Cor</Label>
                    <Input
                      id={`color-${variant.id}`}
                      value={variant.color}
                      onChange={(event) =>
                        updateVariant(variant.id, { color: event.target.value })
                      }
                      placeholder="Lavanda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`hex-${variant.id}`}>Tom</Label>
                    <input
                      id={`hex-${variant.id}`}
                      type="color"
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(variant.id, { colorHex: event.target.value })
                      }
                      className="h-10 w-full cursor-pointer rounded-md border border-input bg-white p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sku-${variant.id}`}>SKU</Label>
                    <Input
                      id={`sku-${variant.id}`}
                      value={variant.sku}
                      onChange={(event) => updateVariant(variant.id, { sku: event.target.value })}
                      placeholder={`PROD-${index + 1}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`stock-${variant.id}`}>Quantidade</Label>
                    <Input
                      id={`stock-${variant.id}`}
                      type="number"
                      min={0}
                      value={variant.stockQuantity}
                      onChange={(event) =>
                        updateVariant(variant.id, {
                          stockQuantity: Math.max(0, Number(event.target.value))
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      disabled={variants.length === 1}
                      aria-label="Remover variacao"
                      className="flex h-10 w-10 items-center justify-center rounded-md text-[#B500B2] transition-colors hover:bg-[#B500B2]/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[1fr_180px]">
            <Field
              label="ID do produto no AbacatePay"
              name="abacatepayProductId"
              placeholder="Opcional"
            />
            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 accent-[#B500B2]"
              />
              Produto ativo
            </label>
          </section>

          {state.message ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/produtos">Cancelar</Link>
            </Button>
            <Button disabled={pending} className="rounded-full px-6">
              {pending ? "Salvando..." : "Cadastrar produto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} required={required} />
    </div>
  );
}
