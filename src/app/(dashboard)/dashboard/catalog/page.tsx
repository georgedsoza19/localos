import { eq } from "drizzle-orm";
import { requireOrg } from "@/lib/session";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { CatalogForms } from "./catalog-forms";
import { ProductRow } from "./product-row";

export default async function CatalogPage() {
  const { organization } = await requireOrg();
  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.organizationId, organization.id));
  const items = await db
    .select()
    .from(products)
    .where(eq(products.organizationId, organization.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Catalog</h1>
        <p className="mt-1 text-sm text-stone-600">
          Products & services shown on your microsites. Import CSV or add manually.
        </p>
      </div>

      <CatalogForms categories={cats.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-4 py-3 text-sm font-medium text-stone-500">
          {items.length} items
        </div>
        <ul className="divide-y divide-stone-100">
          {items.map((p) => (
            <ProductRow
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                price: p.price,
                featured: p.featured,
                active: p.active,
                images: p.images,
              }}
            />
          ))}
          {items.length === 0 && (
            <li className="p-6 text-sm text-stone-500">No products yet.</li>
          )}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Badge key={c.id} variant="secondary">
            {c.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
