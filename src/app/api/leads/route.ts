import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  journeyEvents,
  leads,
  organizations,
  stores,
} from "@/db/schema";
import { id } from "@/lib/ids";
import { z } from "zod";

const schema = z.object({
  orgSlug: z.string(),
  storeSlug: z.string().optional(),
  productId: z.string().optional(),
  channel: z.enum(["form", "whatsapp", "call"]),
  name: z.string().optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
  consent: z.boolean().default(false),
  visitorId: z.string().min(8),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  landingPage: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, body.orgSlug))
      .limit(1);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(
        and(
          eq(leads.organizationId, org.id),
          gte(leads.createdAt, monthStart),
        ),
      );
    if (count >= org.leadLimit) {
      return NextResponse.json(
        { error: "Lead limit reached for this plan" },
        { status: 402 },
      );
    }

    let storeId: string | undefined;
    if (body.storeSlug) {
      const [store] = await db
        .select()
        .from(stores)
        .where(
          and(
            eq(stores.slug, body.storeSlug),
            eq(stores.organizationId, org.id),
          ),
        )
        .limit(1);
      storeId = store?.id;
    }

    let score = body.channel === "form" ? 30 : body.channel === "whatsapp" ? 25 : 20;
    if (body.utmSource) score += 5;

    const leadId = id("lead");
    await db.insert(leads).values({
      id: leadId,
      organizationId: org.id,
      storeId,
      productId: body.productId,
      channel: body.channel,
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      message: body.message,
      consent: body.consent,
      visitorId: body.visitorId,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      landingPage: body.landingPage,
      score,
    });

    await db
      .update(journeyEvents)
      .set({ leadId })
      .where(
        and(
          eq(journeyEvents.visitorId, body.visitorId),
          eq(journeyEvents.organizationId, org.id),
        ),
      );

    await db.insert(journeyEvents).values({
      id: id("evt"),
      organizationId: org.id,
      storeId,
      leadId,
      visitorId: body.visitorId,
      eventType: "lead_created",
      pagePath: body.landingPage,
      meta: { channel: body.channel },
    });

    return NextResponse.json({ ok: true, leadId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
