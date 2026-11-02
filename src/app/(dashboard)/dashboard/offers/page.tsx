import { eq } from "drizzle-orm";
import { requireOrg, getOrgStores } from "@/lib/session";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { OfferForms } from "./offer-forms";

export default async function OffersPage() {
  const { organization } = await requireOrg();
  const storeList = await getOrgStores(organization.id);
  const rows = await db
    .select()
    .from(offers)
    .where(eq(offers.organizationId, organization.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Offers</h1>
        <p className="mt-1 text-sm text-stone-600">
          Festive and weekend banners on brand or store microsites.
        </p>
      </div>
      <OfferForms
        stores={storeList.map((s) => ({ id: s.id, name: s.name }))}
        offers={rows.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          active: o.active,
        }))}
      />
    </div>
  );
}
