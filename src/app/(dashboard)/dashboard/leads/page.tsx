import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireOrg } from "@/lib/session";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { LeadsExport } from "./leads-export";

export default async function LeadsPage() {
  const { organization } = await requireOrg();
  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.organizationId, organization.id))
    .orderBy(desc(leads.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Leads CRM</h1>
          <p className="mt-1 text-sm text-stone-600">
            Form, WhatsApp, and call leads with journey timelines.
          </p>
        </div>
        <LeadsExport
          rows={rows.map((r) => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            channel: r.channel,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-stone-50/80">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/leads/${l.id}`} className="font-medium text-teal-900 underline-offset-2 hover:underline">
                    {l.name || l.phone || "Unknown"}
                  </Link>
                  <p className="text-xs text-stone-500">{l.phone}</p>
                </td>
                <td className="px-4 py-3 capitalize">{l.channel}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {l.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">{l.score}</td>
                <td className="px-4 py-3 text-stone-500">
                  {l.createdAt.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
