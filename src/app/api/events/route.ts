import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { journeyEvents, organizations, stores } from "@/db/schema";
import { id } from "@/lib/ids";
import { z } from "zod";

const schema = z.object({
  orgSlug: z.string(),
  storeSlug: z.string().optional(),
  visitorId: z.string().min(8),
  eventType: z.string(),
  pagePath: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
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

    let storeId: string | undefined;
    if (body.storeSlug) {
      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.slug, body.storeSlug))
        .limit(1);
      if (store?.organizationId === org.id) storeId = store.id;
    }

    await db.insert(journeyEvents).values({
      id: id("evt"),
      organizationId: org.id,
      storeId,
      visitorId: body.visitorId,
      eventType: body.eventType,
      pagePath: body.pagePath,
      meta: body.meta ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
