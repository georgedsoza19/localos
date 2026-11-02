import Link from "next/link";
import { and, eq, gte, sql } from "drizzle-orm";
import { requireOrg, getOrgStores } from "@/lib/session";
import { db } from "@/db";
import { leads, products } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardHome() {
  const { organization } = await requireOrg();
  if (!organization.onboardingCompleted) {
    // soft nudge — onboarding page still available
  }

  const storeList = await getOrgStores(organization.id);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [leadCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(
      and(eq(leads.organizationId, organization.id), gte(leads.createdAt, monthStart)),
    );

  const [newLeads] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(and(eq(leads.organizationId, organization.id), eq(leads.status, "new")));

  const [productCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.organizationId, organization.id));

  const recent = await db
    .select()
    .from(leads)
    .where(eq(leads.organizationId, organization.id))
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">{organization.name}</h1>
          <p className="mt-1 text-sm text-stone-600">
            Plan: <Badge variant="secondary">{organization.plan}</Badge> ·{" "}
            {leadCount.count}/{organization.leadLimit} leads this month
          </p>
        </div>
        <div className="flex gap-2">
          {!organization.onboardingCompleted && (
            <Link href="/dashboard/onboarding">
              <Button variant="outline">Finish setup</Button>
            </Link>
          )}
          <Link href={`/s/${organization.slug}`} target="_blank">
            <Button className="bg-teal-800">View microsite</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Stores", value: storeList.length, href: "/dashboard/stores" },
          { label: "Catalog items", value: productCount.count, href: "/dashboard/catalog" },
          { label: "New leads", value: newLeads.count, href: "/dashboard/leads" },
          { label: "Leads (month)", value: leadCount.count, href: "/dashboard/analytics" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="border-stone-200 shadow-none transition hover:border-teal-700/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-stone-200 shadow-none">
        <CardHeader>
          <CardTitle className="font-serif text-xl font-normal">Recent leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-stone-500">
              No leads yet. Share your microsite or QR code to start capturing.
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{l.name || l.phone || "Unknown"}</p>
                    <p className="text-stone-500">
                      {l.channel} · {l.status}
                    </p>
                  </div>
                  <Link href={`/dashboard/leads/${l.id}`} className="text-teal-800 underline">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
