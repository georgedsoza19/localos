"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, products, storeProducts } from "@/db/schema";
import { id, slugify } from "@/lib/ids";
import { requireOrg } from "@/lib/session";

export async function createCategory(name: string) {
  const { organization } = await requireOrg();
  const catId = id("cat");
  await db.insert(categories).values({
    id: catId,
    organizationId: organization.id,
    name,
    slug: slugify(name),
  });
  revalidatePath("/dashboard/catalog");
  return catId;
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price?: string;
  fromPrice?: boolean;
  categoryId?: string;
  images?: string[];
  featured?: boolean;
}) {
  const { organization } = await requireOrg();
  const productId = id("prd");
  await db.insert(products).values({
    id: productId,
    organizationId: organization.id,
    name: input.name,
    slug: slugify(input.name) + "-" + productId.slice(-4),
    description: input.description,
    price: input.price,
    fromPrice: input.fromPrice ?? false,
    categoryId: input.categoryId,
    images: input.images ?? [],
    featured: input.featured ?? false,
  });
  revalidatePath("/dashboard/catalog");
  return productId;
}

export async function updateProduct(
  productId: string,
  input: Partial<{
    name: string;
    description: string;
    price: string;
    fromPrice: boolean;
    categoryId: string | null;
    images: string[];
    featured: boolean;
    active: boolean;
  }>,
) {
  await requireOrg();
  await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, productId));
  revalidatePath("/dashboard/catalog");
}

export async function cloneProduct(productId: string) {
  const { organization } = await requireOrg();
  const [p] = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.organizationId, organization.id),
      ),
    )
    .limit(1);
  if (!p) throw new Error("Not found");
  const newId = id("prd");
  await db.insert(products).values({
    ...p,
    id: newId,
    name: `${p.name} (Copy)`,
    slug: slugify(p.name) + "-" + newId.slice(-4),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/dashboard/catalog");
  return newId;
}

export async function setStoreProductOverride(input: {
  storeId: string;
  productId: string;
  available: boolean;
  priceOverride?: string | null;
}) {
  await requireOrg();
  const existing = await db
    .select()
    .from(storeProducts)
    .where(
      and(
        eq(storeProducts.storeId, input.storeId),
        eq(storeProducts.productId, input.productId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(storeProducts)
      .set({
        available: input.available,
        priceOverride: input.priceOverride ?? null,
      })
      .where(eq(storeProducts.id, existing[0].id));
  } else {
    await db.insert(storeProducts).values({
      id: id("sp"),
      storeId: input.storeId,
      productId: input.productId,
      available: input.available,
      priceOverride: input.priceOverride ?? null,
    });
  }
  revalidatePath("/dashboard/catalog");
}

export async function importCatalogCsv(csvText: string) {
  const { organization } = await requireOrg();
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error("CSV needs a header and rows");

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const priceIdx = header.indexOf("price");
  const categoryIdx = header.indexOf("category");
  const descIdx = header.indexOf("description");
  if (nameIdx < 0) throw new Error("CSV must include a name column");

  const catCache = new Map<string, string>();
  let imported = 0;

  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx];
    if (!name) continue;
    let categoryId: string | undefined;
    const catName = categoryIdx >= 0 ? cols[categoryIdx] : "";
    if (catName) {
      if (!catCache.has(catName)) {
        const existing = await db
          .select()
          .from(categories)
          .where(
            and(
              eq(categories.organizationId, organization.id),
              eq(categories.name, catName),
            ),
          )
          .limit(1);
        if (existing[0]) {
          catCache.set(catName, existing[0].id);
        } else {
          const catId = id("cat");
          await db.insert(categories).values({
            id: catId,
            organizationId: organization.id,
            name: catName,
            slug: slugify(catName),
          });
          catCache.set(catName, catId);
        }
      }
      categoryId = catCache.get(catName);
    }

    const productId = id("prd");
    await db.insert(products).values({
      id: productId,
      organizationId: organization.id,
      name,
      slug: slugify(name) + "-" + productId.slice(-4),
      price: priceIdx >= 0 ? cols[priceIdx] || null : null,
      description: descIdx >= 0 ? cols[descIdx] : null,
      categoryId,
      images: [],
    });
    imported++;
  }

  revalidatePath("/dashboard/catalog");
  return { imported };
}
