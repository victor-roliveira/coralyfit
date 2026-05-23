"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/features/admin/auth";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type ProductActionState = {
  message?: string;
  success?: boolean;
};

const productSchema = z.object({
  name: z.string().trim().min(3, "Informe um nome com pelo menos 3 caracteres."),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(12, "Descreva melhor o produto."),
  categoryId: z.string().trim().uuid("Selecione uma categoria."),
  price: z.string().trim().min(1, "Informe o preco."),
  variantsJson: z.string().trim().min(1, "Informe pelo menos uma variacao."),
  active: z.string().optional(),
  abacatepayProductId: z.string().trim().optional()
});

type VariantInput = {
  size: string;
  color: string;
  color_hex: string | null;
  sku: string | null;
  stock_quantity: number;
};

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const { supabase } = await requireAdmin();

  if (!supabase) {
    return { message: "Configure o Supabase para cadastrar produtos." };
  }

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const priceCents = parsePriceToCents(parsed.data.price);
  if (!priceCents || priceCents <= 0) {
    return { message: "Informe um preco valido." };
  }

  const variants = parseVariants(parsed.data.variantsJson);
  if (!variants.ok) {
    return { message: variants.message };
  }

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  if (!slug) {
    return { message: "Nao foi possivel gerar o slug do produto." };
  }

  const uploadedImages = await uploadProductImages(formData, slug, supabase);
  if (!uploadedImages.ok) {
    return { message: uploadedImages.message };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      price_cents: priceCents,
      images: uploadedImages.urls,
      active: parsed.data.active === "on",
      abacatepay_product_id: parsed.data.abacatepayProductId || null
    })
    .select("id")
    .single();

  if (productError || !product) {
    await removeUploadedImages(uploadedImages.paths, supabase);

    return {
      message:
        productError?.code === "23505"
          ? "Ja existe um produto com esse slug."
          : "Nao foi possivel cadastrar o produto."
    };
  }

  const { error: variantsError } = await supabase.from("product_variants").insert(
    variants.items.map((variant) => ({
      product_id: product.id,
      ...variant
    }))
  );

  if (variantsError) {
    await supabase.from("products").delete().eq("id", product.id);
    await removeUploadedImages(uploadedImages.paths, supabase);

    return {
      message:
        variantsError.code === "23505"
          ? "Existe SKU ou variacao duplicada. Revise tamanho, cor e SKU."
          : "Nao foi possivel cadastrar as variacoes."
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProductStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  if (!supabase) return;

  const productId = String(formData.get("productId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  if (!productId) return;

  await supabase
    .from("products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", productId);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
}

function parsePriceToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;

  return Math.round(number * 100);
}

function parseVariants(value: string):
  | { ok: true; items: VariantInput[] }
  | { ok: false; message: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return { ok: false, message: "Nao foi possivel ler as variacoes." };
  }

  const result = z
    .array(
      z.object({
        size: z.string().trim().min(1),
        color: z.string().trim().min(1),
        colorHex: z.string().trim().optional(),
        sku: z.string().trim().optional(),
        stockQuantity: z.coerce.number().int().min(0)
      })
    )
    .min(1)
    .safeParse(parsed);

  if (!result.success) {
    return { ok: false, message: "Revise as variacoes de tamanho, cor e estoque." };
  }

  const seen = new Set<string>();
  const items: VariantInput[] = [];

  for (const [index, variant] of result.data.entries()) {
    const key = `${variant.size.toLowerCase()}|${variant.color.toLowerCase()}`;
    if (seen.has(key)) {
      return {
        ok: false,
        message: `Variacao duplicada na linha ${index + 1}: ${variant.size} / ${variant.color}.`
      };
    }
    seen.add(key);

    items.push({
      size: variant.size.toUpperCase(),
      color: variant.color,
      color_hex: variant.colorHex || null,
      sku: variant.sku || null,
      stock_quantity: variant.stockQuantity
    });
  }

  if (items.length === 0) {
    return { ok: false, message: "Informe pelo menos uma variacao." };
  }

  return { ok: true, items };
}

async function uploadProductImages(
  formData: FormData,
  slug: string,
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdmin>>["supabase"]>
): Promise<{ ok: true; urls: string[]; paths: string[] } | { ok: false; message: string }> {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return { ok: false, message: "Envie pelo menos uma imagem do produto." };
  }

  if (files.length > 8) {
    return { ok: false, message: "Envie no maximo 8 imagens por produto." };
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        ok: false,
        message: "Use apenas imagens JPG, PNG, WebP ou AVIF."
      };
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        ok: false,
        message: "Cada imagem deve ter no maximo 10 MB."
      };
    }
  }

  const batchId = randomUUID();
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const extension = extensionFromMime(file.type);
      const path = `${slug}/${batchId}-${index + 1}.${extension}`;
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false
        });

      if (error) {
        return { path, error, url: null };
      }

      const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
      return { path, error: null, url: data.publicUrl };
    })
  );

  const failedUpload = uploads.find((upload) => upload.error);
  const uploadedPaths = uploads
    .filter((upload) => !upload.error)
    .map((upload) => upload.path);

  if (failedUpload?.error) {
    await removeUploadedImages(uploadedPaths, supabase);
    return {
      ok: false,
      message:
        failedUpload.error.message.includes("Bucket not found")
          ? "Crie/rode a migration do bucket product-images antes de enviar imagens."
          : "Nao foi possivel enviar uma das imagens."
    };
  }

  return {
    ok: true,
    urls: uploads.map((upload) => upload.url).filter((url): url is string => Boolean(url)),
    paths: uploads.map((upload) => upload.path)
  };
}

async function removeUploadedImages(
  paths: string[],
  supabase: NonNullable<Awaited<ReturnType<typeof requireAdmin>>["supabase"]>
) {
  if (paths.length === 0) return;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);
}

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
