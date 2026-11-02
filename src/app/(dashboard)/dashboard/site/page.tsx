import { and, eq, isNull } from "drizzle-orm";
import { requireOrg, getOrgStores } from "@/lib/session";
import { db } from "@/db";
import { siteConfigs } from "@/db/schema";
import { SiteEditor } from "./site-editor";

export default async function SitePage() {
  const { organization } = await requireOrg();
  const storeList = await getOrgStores(organization.id);
  const [brandSite] = await db
    .select()
    .from(siteConfigs)
    .where(
      and(
        eq(siteConfigs.organizationId, organization.id),
        isNull(siteConfigs.storeId),
      ),
    )
    .limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Microsite</h1>
        <p className="mt-1 text-sm text-stone-600">
          Industry template, SEO, sticky CTAs, testimonials & FAQ. Live at{" "}
          <code className="rounded bg-stone-200/60 px-1">/s/{organization.slug}</code>
        </p>
      </div>
      <SiteEditor
        orgSlug={organization.slug}
        initial={{
          template: brandSite?.template || organization.industry || "retail",
          headline: brandSite?.headline || organization.name,
          subheadline: brandSite?.subheadline || organization.tagline || "",
          metaTitle: brandSite?.metaTitle || organization.name,
          metaDescription: brandSite?.metaDescription || "",
          ogImage: brandSite?.ogImage || "",
          stickyCall: brandSite?.stickyCall ?? true,
          stickyWhatsapp: brandSite?.stickyWhatsapp ?? true,
          stickyEnquire: brandSite?.stickyEnquire ?? true,
          content: brandSite?.content || {
            testimonials: [],
            faq: [],
            gallery: [],
            team: [],
          },
        }}
        stores={storeList.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
