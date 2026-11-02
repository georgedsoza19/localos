"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { offers, siteConfigs } from "@/db/schema";
import { id } from "@/lib/ids";
import { requireOrg } from "@/lib/session";

export async function updateSiteConfig(input: {
  storeId?: string | null;
  template?: "clinic" | "salon" | "retail";
  headline?: string;
  subheadline?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  stickyCall?: boolean;
  stickyWhatsapp?: boolean;
  stickyEnquire?: boolean;
  content?: {
    testimonials?: { name: string; quote: string; rating?: number }[];
    faq?: { q: string; a: string }[];
    gallery?: string[];
    team?: { name: string; role: string; image?: string }[];
  };
}) {
  const { organization } = await requireOrg();
  const condition = input.storeId
    ? and(
        eq(siteConfigs.organizationId, organization.id),
        eq(siteConfigs.storeId, input.storeId),
      )
    : and(
        eq(siteConfigs.organizationId, organization.id),
        isNull(siteConfigs.storeId),
      );

  const [existing] = await db.select().from(siteConfigs).where(condition).limit(1);
  if (!existing) {
    await db.insert(siteConfigs).values({
      id: id("site"),
      organizationId: organization.id,
      storeId: input.storeId || null,
      template: input.template || organization.industry || "retail",
      headline: input.headline,
      subheadline: input.subheadline,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      ogImage: input.ogImage,
      stickyCall: input.stickyCall ?? true,
      stickyWhatsapp: input.stickyWhatsapp ?? true,
      stickyEnquire: input.stickyEnquire ?? true,
      content: input.content ?? {},
    });
  } else {
    await db
      .update(siteConfigs)
      .set({
        template: input.template ?? existing.template,
        headline: input.headline ?? existing.headline,
        subheadline: input.subheadline ?? existing.subheadline,
        metaTitle: input.metaTitle ?? existing.metaTitle,
        metaDescription: input.metaDescription ?? existing.metaDescription,
        ogImage: input.ogImage ?? existing.ogImage,
        stickyCall: input.stickyCall ?? existing.stickyCall,
        stickyWhatsapp: input.stickyWhatsapp ?? existing.stickyWhatsapp,
        stickyEnquire: input.stickyEnquire ?? existing.stickyEnquire,
        content: input.content ?? existing.content,
        updatedAt: new Date(),
      })
      .where(eq(siteConfigs.id, existing.id));
  }
  revalidatePath("/dashboard/site");
}

export async function createOffer(input: {
  title: string;
  description?: string;
  storeId?: string;
  bannerImage?: string;
  startsAt?: string;
  endsAt?: string;
}) {
  const { organization } = await requireOrg();
  await db.insert(offers).values({
    id: id("ofr"),
    organizationId: organization.id,
    storeId: input.storeId,
    title: input.title,
    description: input.description,
    bannerImage: input.bannerImage,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  });
  revalidatePath("/dashboard/offers");
}

export async function deleteOffer(offerId: string) {
  await requireOrg();
  await db.delete(offers).where(eq(offers.id, offerId));
  revalidatePath("/dashboard/offers");
}
