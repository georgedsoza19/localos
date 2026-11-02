import Link from "next/link";
import { requireOrg, getOrgStores } from "@/lib/session";
import { getOpenStatus } from "@/lib/hours";
import { Badge } from "@/components/ui/badge";
import { StoreForm } from "./store-form";
import { StoreActions } from "./store-actions";

export default async function StoresPage() {
  const { organization } = await requireOrg();
  const storeList = await getOrgStores(organization.id);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Stores</h1>
          <p className="mt-1 text-sm text-stone-600">
            {storeList.length}/{organization.storeLimit} stores on {organization.plan} plan
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {storeList.map((s) => {
          const open = getOpenStatus(s.hours);
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{s.name}</h2>
                  <Badge variant={s.published ? "default" : "secondary"}>
                    {s.published ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">{open.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  {[s.city, s.pincode].filter(Boolean).join(" · ")} · {s.phone}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <Link
                    href={`/s/${organization.slug}/store/${s.slug}`}
                    className="text-teal-800 underline"
                    target="_blank"
                  >
                    Live microsite
                  </Link>
                  {!s.published && s.previewToken && (
                    <Link
                      href={`/s/${organization.slug}/store/${s.slug}?preview=${s.previewToken}`}
                      className="text-stone-600 underline"
                      target="_blank"
                    >
                      Preview
                    </Link>
                  )}
                </div>
              </div>
              <StoreActions
                storeId={s.id}
                published={s.published}
                orgSlug={organization.slug}
                storeSlug={s.slug}
                storeName={s.name}
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-serif text-xl">Add store</h2>
        <StoreForm />
      </div>
    </div>
  );
}
