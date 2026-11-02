import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Microsite } from "@/components/sites/microsite";
import { loadBrandSite } from "@/lib/sites/load";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const data = await loadBrandSite(orgSlug);
  if (!data) return {};
  return {
    title: data.site?.metaTitle || data.org.name,
    description: data.site?.metaDescription || data.org.tagline || undefined,
    openGraph: {
      title: data.site?.metaTitle || data.org.name,
      description: data.site?.metaDescription || undefined,
      images: data.site?.ogImage ? [data.site.ogImage] : undefined,
    },
  };
}

export default async function BrandSitePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const data = await loadBrandSite(orgSlug);
  if (!data) notFound();

  return (
    <Microsite
      mode="brand"
      org={{
        name: data.org.name,
        slug: data.org.slug,
        logo: data.org.logo,
        tagline: data.org.tagline,
        primaryColor: data.org.primaryColor,
        industry: data.org.industry,
        socialInstagram: data.org.socialInstagram,
        socialFacebook: data.org.socialFacebook,
      }}
      stores={data.storeList.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        city: s.city,
        pincode: s.pincode,
        phone: s.phone,
        whatsapp: s.whatsapp,
        addressLine1: s.addressLine1,
        mapsUrl: s.mapsUrl,
        hours: s.hours,
        published: s.published,
      }))}
      products={data.catalog.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        fromPrice: p.fromPrice,
        images: p.images,
        featured: p.featured,
      }))}
      offers={data.offerRows.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        bannerImage: o.bannerImage,
      }))}
      site={{
        template: data.site?.template || data.org.industry || "retail",
        headline: data.site?.headline || data.org.name,
        subheadline: data.site?.subheadline || data.org.tagline,
        stickyCall: data.site?.stickyCall ?? true,
        stickyWhatsapp: data.site?.stickyWhatsapp ?? true,
        stickyEnquire: data.site?.stickyEnquire ?? true,
        content: data.site?.content || {},
      }}
    />
  );
}
