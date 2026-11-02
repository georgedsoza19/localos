/**
 * Seeds two pilot SMB brands (salon + clinic) for local demos.
 * Run: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { nanoid } from "nanoid";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function id(prefix: string) {
  return `${prefix}_${nanoid(10)}`;
}

async function main() {
  const ownerEmail = "pilot@localos.app";
  let [owner] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, ownerEmail))
    .limit(1);

  if (!owner) {
    const userId = id("user");
    await db.insert(schema.users).values({
      id: userId,
      name: "Pilot Owner",
      email: ownerEmail,
      emailVerified: true,
    });
    owner = {
      id: userId,
      name: "Pilot Owner",
      email: ownerEmail,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("Created user shell:", ownerEmail);
  }

  const salonSlug = "glow-salon";
  const existingSalon = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, salonSlug))
    .limit(1);

  if (!existingSalon.length) {
    const orgId = id("org");
    await db.insert(schema.organizations).values({
      id: orgId,
      name: "Glow Salon",
      slug: salonSlug,
      tagline: "Neighbourhood beauty, WhatsApp-ready",
      industry: "salon",
      primaryColor: "#BE185D",
      onboardingCompleted: true,
      plan: "free",
    });
    await db.insert(schema.memberships).values({
      id: id("mem"),
      organizationId: orgId,
      userId: owner.id,
      role: "owner",
    });
    const storeId = id("str");
    await db.insert(schema.stores).values({
      id: storeId,
      organizationId: orgId,
      name: "Glow Salon — Indiranagar",
      slug: "indiranagar",
      phone: "9876543210",
      whatsapp: "9876543210",
      city: "Bengaluru",
      pincode: "560038",
      addressLine1: "100 Feet Road",
      published: true,
      publishedAt: new Date(),
      previewToken: id("prev"),
      hours: {
        monday: { open: "10:00", close: "20:00" },
        tuesday: { open: "10:00", close: "20:00" },
        wednesday: { open: "10:00", close: "20:00" },
        thursday: { open: "10:00", close: "20:00" },
        friday: { open: "10:00", close: "20:00" },
        saturday: { open: "10:00", close: "21:00" },
        sunday: { open: "11:00", close: "18:00" },
      },
      servicePincodes: ["560038", "560037"],
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Indiranagar+Bengaluru",
    });
    await db.insert(schema.siteConfigs).values({
      id: id("site"),
      organizationId: orgId,
      template: "salon",
      headline: "Look fresh. Book nearby.",
      subheadline: "Hair · Skin · Nails — enquire on WhatsApp in one tap.",
      metaTitle: "Glow Salon Indiranagar",
      metaDescription: "Hyperlocal salon microsite",
      content: {
        testimonials: [
          { name: "Ananya", quote: "Booked via WhatsApp in 2 minutes.", rating: 5 },
        ],
        faq: [{ q: "Do you take walk-ins?", a: "Yes, or enquire online first." }],
        team: [{ name: "Riya", role: "Senior stylist" }],
        gallery: [],
      },
    });
    await db.insert(schema.products).values([
      {
        id: id("prd"),
        organizationId: orgId,
        name: "Signature Haircut",
        slug: "signature-haircut",
        price: "699",
        featured: true,
        description: "Wash, cut, and style",
        images: [],
      },
      {
        id: id("prd"),
        organizationId: orgId,
        name: "Keratin Glow",
        slug: "keratin-glow",
        price: "3499",
        fromPrice: true,
        featured: true,
        description: "Smooth treatment",
        images: [],
      },
    ]);
    await db.insert(schema.offers).values({
      id: id("ofr"),
      organizationId: orgId,
      title: "Weekday 20% off colour",
      description: "Tue–Thu only. Mention LocalOS.",
      active: true,
    });
    console.log("Seeded salon:", `http://localhost:3000/s/${salonSlug}`);
  }

  const clinicSlug = "care-clinic";
  const existingClinic = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, clinicSlug))
    .limit(1);

  if (!existingClinic.length) {
    const orgId = id("org");
    await db.insert(schema.organizations).values({
      id: orgId,
      name: "Care Clinic",
      slug: clinicSlug,
      tagline: "Family care near you",
      industry: "clinic",
      primaryColor: "#0F766E",
      onboardingCompleted: true,
    });
    await db.insert(schema.stores).values({
      id: id("str"),
      organizationId: orgId,
      name: "Care Clinic — HSR",
      slug: "hsr",
      phone: "9123456780",
      whatsapp: "9123456780",
      city: "Bengaluru",
      pincode: "560102",
      addressLine1: "27th Main",
      published: true,
      publishedAt: new Date(),
      previewToken: id("prev"),
      hours: {
        monday: { open: "09:00", close: "21:00" },
        tuesday: { open: "09:00", close: "21:00" },
        wednesday: { open: "09:00", close: "21:00" },
        thursday: { open: "09:00", close: "21:00" },
        friday: { open: "09:00", close: "21:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { open: "00:00", close: "00:00", closed: true },
      },
      servicePincodes: ["560102"],
    });
    await db.insert(schema.siteConfigs).values({
      id: id("site"),
      organizationId: orgId,
      template: "clinic",
      headline: "Trusted care in HSR",
      subheadline: "Consultations, diagnostics, home visits enquiry.",
      content: {
        team: [{ name: "Dr. Mehta", role: "General physician" }],
        faq: [{ q: "Emergency?", a: "Call the clinic number immediately." }],
        testimonials: [],
        gallery: [],
      },
    });
    await db.insert(schema.products).values({
      id: id("prd"),
      organizationId: orgId,
      name: "GP Consultation",
      slug: "gp-consultation",
      price: "500",
      featured: true,
      description: "15–20 min consult",
      images: [],
    });
    console.log("Seeded clinic:", `http://localhost:3000/s/${clinicSlug}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
