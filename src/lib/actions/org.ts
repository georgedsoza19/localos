"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  invitations,
  memberships,
  organizations,
  siteConfigs,
  users,
} from "@/db/schema";
import { id, slugify } from "@/lib/ids";
import { requireSession, requireOrg } from "@/lib/session";
import { DEFAULT_HOURS } from "@/lib/hours";
import { stores } from "@/db/schema";

export async function createOrganization(input: {
  name: string;
  industry: "clinic" | "salon" | "retail";
  tagline?: string;
}) {
  const session = await requireSession();
  const existing = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1);
  if (existing.length) {
    throw new Error("You already belong to an organization");
  }

  let slug = slugify(input.name);
  const clash = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  if (clash.length) slug = `${slug}-${id().slice(0, 4)}`;

  const orgId = id("org");
  await db.insert(organizations).values({
    id: orgId,
    name: input.name,
    slug,
    industry: input.industry,
    tagline: input.tagline,
    primaryColor: input.industry === "clinic" ? "#0F766E" : input.industry === "salon" ? "#BE185D" : "#B45309",
  });

  await db.insert(memberships).values({
    id: id("mem"),
    organizationId: orgId,
    userId: session.user.id,
    role: "owner",
  });

  await db.insert(siteConfigs).values({
    id: id("site"),
    organizationId: orgId,
    template: input.industry,
    headline: input.name,
    subheadline: input.tagline || "Visit us nearby — call, WhatsApp, or enquire online.",
    metaTitle: input.name,
    metaDescription: input.tagline || `${input.name} — hyperlocal storefront`,
    content: {
      testimonials: [],
      faq: [
        {
          q: "How do I book / enquire?",
          a: "Use Call, WhatsApp, or the enquire form on this page.",
        },
      ],
      gallery: [],
      team: [],
    },
  });

  revalidatePath("/dashboard");
  return { orgId, slug };
}

export async function updateOrganization(input: {
  name?: string;
  tagline?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  industry?: "clinic" | "salon" | "retail";
}) {
  const { organization } = await requireOrg();
  await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, organization.id));
  revalidatePath("/dashboard");
}

export async function completeOnboarding() {
  const { organization } = await requireOrg();
  await db
    .update(organizations)
    .set({ onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(organizations.id, organization.id));
  revalidatePath("/dashboard");
}

export async function createStore(input: {
  name: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  pincode?: string;
  addressLine1?: string;
  state?: string;
  lat?: string;
  lng?: string;
  servicePincodes?: string[];
}) {
  const { organization, membership } = await requireOrg();
  if (!["owner", "brand_manager"].includes(membership.role)) {
    throw new Error("Not allowed");
  }

  const existingStores = await db
    .select()
    .from(stores)
    .where(eq(stores.organizationId, organization.id));
  if (existingStores.length >= organization.storeLimit) {
    throw new Error("Store limit reached. Upgrade your plan.");
  }

  let slug = slugify(input.name);
  const orgId = organization.id;
  const storeId = id("str");
  const previewToken = id("prev");

  await db.insert(stores).values({
    id: storeId,
    organizationId: orgId,
    name: input.name,
    slug,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    city: input.city,
    pincode: input.pincode,
    addressLine1: input.addressLine1,
    state: input.state,
    lat: input.lat,
    lng: input.lng,
    mapsUrl:
      input.lat && input.lng
        ? `https://www.google.com/maps?q=${input.lat},${input.lng}`
        : input.city
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${input.name} ${input.city} ${input.pincode || ""}`)}`
          : null,
    hours: DEFAULT_HOURS,
    servicePincodes: input.servicePincodes ?? (input.pincode ? [input.pincode] : []),
    previewToken,
  });

  await db.insert(siteConfigs).values({
    id: id("site"),
    organizationId: orgId,
    storeId,
    template: organization.industry || "retail",
    headline: input.name,
    subheadline: `Visit our ${input.city || "local"} store`,
    metaTitle: `${input.name} | ${organization.name}`,
    metaDescription: `${input.name} in ${input.city || "your city"}`,
    content: { testimonials: [], faq: [], gallery: [], team: [] },
  });

  revalidatePath("/dashboard/stores");
  return { storeId, slug, previewToken };
}

export async function updateStore(
  storeId: string,
  input: Partial<{
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    lat: string;
    lng: string;
    mapsUrl: string;
    hours: Record<string, { open: string; close: string; closed?: boolean }>;
    servicePincodes: string[];
    published: boolean;
  }>,
) {
  const { organization } = await requireOrg();
  const patch = { ...input, updatedAt: new Date() } as Record<string, unknown>;
  if (input.published === true) {
    patch.publishedAt = new Date();
  }
  await db
    .update(stores)
    .set(patch)
    .where(eq(stores.id, storeId));
  void organization;
  revalidatePath("/dashboard/stores");
}

export async function inviteTeamMember(input: {
  email: string;
  role: "brand_manager" | "store_manager" | "staff";
  storeId?: string;
}) {
  const { organization, membership } = await requireOrg();
  if (!["owner", "brand_manager"].includes(membership.role)) {
    throw new Error("Not allowed");
  }
  const token = id("inv");
  await db.insert(invitations).values({
    id: id("invite"),
    organizationId: organization.id,
    email: input.email.toLowerCase(),
    role: input.role,
    storeId: input.storeId,
    token,
  });

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);
  if (existingUser) {
    await db.insert(memberships).values({
      id: id("mem"),
      organizationId: organization.id,
      userId: existingUser.id,
      role: input.role,
      storeId: input.storeId,
    });
    await db
      .update(invitations)
      .set({ accepted: true })
      .where(eq(invitations.token, token));
  }

  revalidatePath("/dashboard/team");
  return { token, inviteUrl: `/signup?invite=${token}` };
}
