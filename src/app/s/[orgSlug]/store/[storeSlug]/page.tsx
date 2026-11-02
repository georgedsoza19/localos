import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Microsite } from "@/components/sites/microsite";
import { loadStoreSite } from "@/lib/sites/load";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; storeSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, storeSlug } = await params;
  const data = await loadStoreSite(orgSlug, storeSlug);
  if (!data?.store) return {};
  return {
    title: data.site?.metaTitle || `${data.store.name} | ${data.org.name}`,
    description: data.site?.metaDescription || undefined,
    openGraph: {
      title: data.site?.metaTitle || data.store.name,
      images: data.site?.ogImage ? [data.site.ogImage] : undefined,
    },
  };
}

export default async function StoreSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; storeSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { orgSlug, storeSlug } = await params;
  const { preview } = await searchParams;
  const data = await loadStoreSite(orgSlug, storeSlug, preview);
  if (!data) notFound();
  if (data.forbidden || !data.store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EC] p-6 text-center">
        <div>
          <h1 className="font-serif text-2xl">Store not published</h1>
          <p className="mt-2 text-sm text-stone-600">
            Ask the brand for a preview link or wait until they publish.
          </p>
        </div>
      </main>
    );
  }

  return (
    <Microsite
      mode="store"
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
      store={{
        id: data.store.id,
        name: data.store.name,
        slug: data.store.slug,
        city: data.store.city,
        pincode: data.store.pincode,
        phone: data.store.phone,
        whatsapp: data.store.whatsapp,
        addressLine1: data.store.addressLine1,
        mapsUrl: data.store.mapsUrl,
        hours: data.store.hours,
        published: data.store.published,
      }}
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
        headline: data.site?.headline || data.store.name,
        subheadline: data.site?.subheadline || data.org.tagline,
        stickyCall: data.site?.stickyCall ?? true,
        stickyWhatsapp: data.site?.stickyWhatsapp ?? true,
        stickyEnquire: data.site?.stickyEnquire ?? true,
        content: data.site?.content || {},
      }}
    />
  );
}
