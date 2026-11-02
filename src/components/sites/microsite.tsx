"use client";

import Link from "next/link";
import { MapPin, Share2, Star } from "lucide-react";
import { LeadForm } from "./lead-form";
import { StickyCta } from "./sticky-cta";
import { JourneyTracker } from "./tracker";
import { useVisitorId } from "./visitor-provider";
import { getOpenStatus, telLink, whatsappLink } from "@/lib/hours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  fromPrice: boolean;
  images: string[] | null;
  featured: boolean;
};

type Offer = {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string | null;
};

type StoreCard = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  pincode: string | null;
  phone: string | null;
  whatsapp: string | null;
  addressLine1: string | null;
  mapsUrl: string | null;
  hours: Record<string, { open: string; close: string; closed?: boolean }> | null;
  published: boolean;
};

export function Microsite({
  org,
  store,
  stores,
  products,
  offers,
  site,
  mode,
}: {
  org: {
    name: string;
    slug: string;
    logo: string | null;
    tagline: string | null;
    primaryColor: string | null;
    industry: "clinic" | "salon" | "retail" | null;
    socialInstagram: string | null;
    socialFacebook: string | null;
  };
  store?: StoreCard | null;
  stores?: StoreCard[];
  products: Product[];
  offers: Offer[];
  site: {
    template: "clinic" | "salon" | "retail";
    headline: string | null;
    subheadline: string | null;
    stickyCall: boolean;
    stickyWhatsapp: boolean;
    stickyEnquire: boolean;
    content: {
      testimonials?: { name: string; quote: string; rating?: number }[];
      faq?: { q: string; a: string }[];
      gallery?: string[];
      team?: { name: string; role: string; image?: string }[];
    } | null;
  };
  mode: "brand" | "store";
}) {
  const visitorId = useVisitorId();
  const color = org.primaryColor || "#0F766E";
  const phone = store?.phone;
  const whatsapp = store?.whatsapp || phone;
  const open = store ? getOpenStatus(store.hours) : null;
  const content = site.content || {};
  const template = site.template || org.industry || "retail";
  const featured = products.filter((p) => p.featured);
  const catalog = featured.length ? featured : products.slice(0, 8);

  function shareWhatsapp(text: string) {
    const url = whatsappLink(whatsapp || "919999999999", text);
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] pb-24 text-stone-900">
      <JourneyTracker orgSlug={org.slug} storeSlug={store?.slug} />

      <header
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, #1c1917 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(251,191,36,.2), transparent 35%)",
          }}
        />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-white/15 font-serif text-lg">
                {org.name.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="font-serif text-xl leading-none tracking-tight">{org.name}</p>
              {store && (
                <p className="mt-1 text-xs text-white/70">{store.name}</p>
              )}
            </div>
          </div>
          <Badge className="bg-white/15 text-white capitalize hover:bg-white/20">
            {template}
          </Badge>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-8 md:pb-20 md:pt-12">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-100/80">
            {mode === "brand" ? "Find us near you" : "Your neighbourhood store"}
          </p>
          <h1 className="max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
            {site.headline || org.name}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
            {site.subheadline || org.tagline || "Call, WhatsApp, or enquire — we respond fast."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {phone && (
              <a href={telLink(phone)}>
                <Button className="bg-white text-stone-900 hover:bg-amber-50">Call now</Button>
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsappLink(whatsapp, `Hi ${org.name}, I have a question.`)}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  WhatsApp
                </Button>
              </a>
            )}
            {open && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${
                  open.open ? "bg-emerald-400/20 text-emerald-100" : "bg-white/10 text-white/80"
                }`}
              >
                {open.label}
                {open.nextOpen ? ` · opens ${open.nextOpen}` : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      {offers.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">Current offers</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {offers.map((o) => (
              <div
                key={o.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white"
              >
                {o.bannerImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.bannerImage} alt="" className="h-36 w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-medium">{o.title}</h3>
                  {o.description && (
                    <p className="mt-1 text-sm text-stone-600">{o.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">
              {template === "retail" ? "Products" : "Services"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Tap enquire or WhatsApp on any item.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <div className="relative h-40 bg-stone-100">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-medium">{p.name}</h3>
                {p.description && (
                  <p className="line-clamp-2 text-sm text-stone-600">{p.description}</p>
                )}
                {p.price && (
                  <p className="text-sm font-semibold" style={{ color }}>
                    {p.fromPrice ? "From " : ""}₹{p.price}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  {whatsapp && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        shareWhatsapp(
                          `Hi, I'm interested in ${p.name} from ${org.name}${store ? ` (${store.name})` : ""}.`,
                        )
                      }
                    >
                      WhatsApp
                    </Button>
                  )}
                  <a href="#enquire">
                    <Button size="sm" style={{ background: color }}>
                      Enquire
                    </Button>
                  </a>
                </div>
              </div>
            </article>
          ))}
          {catalog.length === 0 && (
            <p className="text-sm text-stone-500">Catalog coming soon.</p>
          )}
        </div>
      </section>

      {mode === "brand" && stores && stores.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">Store locator</h2>
          <p className="mt-1 text-sm text-stone-600">Pick a nearby store for local hours and offers.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stores
              .filter((s) => s.published)
              .map((s) => {
                const st = getOpenStatus(s.hours);
                return (
                  <Link
                    key={s.id}
                    href={`/s/${org.slug}/store/${s.slug}`}
                    className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{s.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
                          <MapPin className="size-3.5" />
                          {[s.addressLine1, s.city, s.pincode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <Badge variant={st.open ? "default" : "secondary"}>{st.label}</Badge>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {content.team && content.team.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">
            {template === "clinic" ? "Doctors & team" : "Our team"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {content.team.map((t, i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-stone-600">{t.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.gallery && content.gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">Gallery</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {content.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        </section>
      )}

      {content.testimonials && content.testimonials.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">What people say</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {content.testimonials.map((t, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="mb-2 flex gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-stone-700">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-2 text-xs font-medium text-stone-500">— {t.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {content.faq && content.faq.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-serif text-2xl">FAQ</h2>
          <div className="mt-4 space-y-3">
            {content.faq.map((f, i) => (
              <details key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Enquire</h2>
          <p className="mt-1 text-sm text-stone-600">We&apos;ll get back on call or WhatsApp.</p>
          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
            {visitorId ? (
              <LeadForm
                orgSlug={org.slug}
                storeSlug={store?.slug}
                visitorId={visitorId}
              />
            ) : (
              <p className="text-sm text-stone-500">Loading form…</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Visit us</h2>
          {store ? (
            <div className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-white p-4 text-sm">
              <p className="font-medium">{store.name}</p>
              <p className="text-stone-600">
                {[store.addressLine1, store.city, store.pincode].filter(Boolean).join(", ")}
              </p>
              {store.mapsUrl && (
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-teal-800 underline"
                >
                  <MapPin className="size-3.5" /> Directions
                </a>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1 text-stone-700"
                onClick={() =>
                  shareWhatsapp(
                    `Check out ${store.name} — ${typeof window !== "undefined" ? window.location.href : ""}`,
                  )
                }
              >
                <Share2 className="size-3.5" /> Share on WhatsApp
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-600">Select a store above for address & directions.</p>
          )}
        </div>
      </section>

      <footer className="border-t border-stone-200 px-4 py-8 text-center text-xs text-stone-500">
        <p>
          {org.name}
          {org.socialInstagram ? (
            <>
              {" · "}
              <a href={org.socialInstagram} className="underline">
                Instagram
              </a>
            </>
          ) : null}
          {org.socialFacebook ? (
            <>
              {" · "}
              <a href={org.socialFacebook} className="underline">
                Facebook
              </a>
            </>
          ) : null}
        </p>
        <p className="mt-2">Powered by LocalOS</p>
      </footer>

      {visitorId && (
        <StickyCta
          orgSlug={org.slug}
          storeSlug={store?.slug}
          phone={phone}
          whatsapp={whatsapp}
          showCall={site.stickyCall}
          showWhatsapp={site.stickyWhatsapp}
          showEnquire={site.stickyEnquire}
          visitorId={visitorId}
        />
      )}
    </div>
  );
}
