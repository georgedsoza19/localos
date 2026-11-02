import { and, eq, gte, sql } from "drizzle-orm";
import { requireOrg } from "@/lib/session";
import { db } from "@/db";
import { journeyEvents, leads } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const { organization } = await requireOrg();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const byChannel = await db
    .select({
      channel: leads.channel,
      count: sql<number>`count(*)::int`,
    })
    .from(leads)
    .where(
      and(eq(leads.organizationId, organization.id), gte(leads.createdAt, monthStart)),
    )
    .groupBy(leads.channel);

  const byStatus = await db
    .select({
      status: leads.status,
      count: sql<number>`count(*)::int`,
    })
    .from(leads)
    .where(eq(leads.organizationId, organization.id))
    .groupBy(leads.status);

  const [views] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(journeyEvents)
    .where(
      and(
        eq(journeyEvents.organizationId, organization.id),
        eq(journeyEvents.eventType, "page_view"),
        gte(journeyEvents.createdAt, monthStart),
      ),
    );

  const [ctas] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(journeyEvents)
    .where(
      and(
        eq(journeyEvents.organizationId, organization.id),
        eq(journeyEvents.eventType, "cta_click"),
        gte(journeyEvents.createdAt, monthStart),
      ),
    );

  const [leadCreates] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(journeyEvents)
    .where(
      and(
        eq(journeyEvents.organizationId, organization.id),
        eq(journeyEvents.eventType, "lead_created"),
        gte(journeyEvents.createdAt, monthStart),
      ),
    );

  const bySource = await db
    .select({
      source: leads.utmSource,
      count: sql<number>`count(*)::int`,
    })
    .from(leads)
    .where(
      and(eq(leads.organizationId, organization.id), gte(leads.createdAt, monthStart)),
    )
    .groupBy(leads.utmSource);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-stone-600">This month funnel and channel mix.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Page views", value: views.count },
          { label: "CTA clicks", value: ctas.count },
          { label: "Leads created", value: leadCreates.count },
        ].map((s) => (
          <Card key={s.label} className="border-stone-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-stone-200 shadow-none">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-normal">By channel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byChannel.map((r) => (
              <div key={r.channel} className="flex justify-between text-sm capitalize">
                <span>{r.channel}</span>
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
            {byChannel.length === 0 && (
              <p className="text-sm text-stone-500">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-none">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-normal">By status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((r) => (
              <div key={r.status} className="flex justify-between text-sm capitalize">
                <span>{r.status}</span>
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-none md:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-normal">UTM sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bySource.map((r) => (
              <div key={String(r.source)} className="flex justify-between text-sm">
                <span>{r.source || "(direct / QR / unknown)"}</span>
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
