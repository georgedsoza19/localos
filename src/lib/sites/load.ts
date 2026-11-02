import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  offers,
  organizations,
  products,
  siteConfigs,
  stores,
} from "@/db/schema";

export async function loadBrandSite(orgSlug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);
  if (!org) return null;

  const storeList = await db
    .select()
    .from(stores)
    .where(eq(stores.organizationId, org.id));

  const [site] = await db
    .select()
    .from(siteConfigs)
    .where(
      and(eq(siteConfigs.organizationId, org.id), isNull(siteConfigs.storeId)),
    )
    .limit(1);

  const catalog = await db
    .select()
    .from(products)
    .where(and(eq(products.organizationId, org.id), eq(products.active, true)));

  const offerRows = await db
    .select()
    .from(offers)
    .where(
      and(
        eq(offers.organizationId, org.id),
        eq(offers.active, true),
        isNull(offers.storeId),
      ),
    );

  return { org, storeList, site, catalog, offerRows };
}

export async function loadStoreSite(
  orgSlug: string,
  storeSlug: string,
  previewToken?: string | null,
) {
  const brand = await loadBrandSite(orgSlug);
  if (!brand) return null;

  const store = brand.storeList.find((s) => s.slug === storeSlug);
  if (!store) return null;

  const canView =
    store.published ||
    (previewToken && store.previewToken === previewToken);
  if (!canView) return { ...brand, store: null, forbidden: true as const };

  const [storeSite] = await db
    .select()
    .from(siteConfigs)
    .where(
      and(
        eq(siteConfigs.organizationId, brand.org.id),
        eq(siteConfigs.storeId, store.id),
      ),
    )
    .limit(1);

  const storeOffers = await db
    .select()
    .from(offers)
    .where(
      and(
        eq(offers.organizationId, brand.org.id),
        eq(offers.active, true),
        or(eq(offers.storeId, store.id), isNull(offers.storeId)),
      ),
    );

  return {
    ...brand,
    store,
    site: storeSite || brand.site,
    offerRows: storeOffers,
    forbidden: false as const,
  };
}
