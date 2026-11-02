import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { requireOrg } from "@/lib/session";
import { db } from "@/db";
import { journeyEvents, leadNotes, leads, memberships, users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { LeadDetailActions } from "./lead-actions";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization } = await requireOrg();
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.organizationId, organization.id)))
    .limit(1);
  if (!lead) notFound();

  const events = await db
    .select()
    .from(journeyEvents)
    .where(
      lead.visitorId
        ? and(
            eq(journeyEvents.organizationId, organization.id),
            eq(journeyEvents.visitorId, lead.visitorId),
          )
        : eq(journeyEvents.leadId, lead.id),
    )
    .orderBy(asc(journeyEvents.createdAt));

  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, lead.id))
    .orderBy(asc(leadNotes.createdAt));

  const team = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.organizationId, organization.id));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/leads" className="text-sm text-teal-800 underline">
        ← Back to leads
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{lead.name || lead.phone || "Lead"}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="capitalize">{lead.channel}</Badge>
            <Badge variant="secondary" className="capitalize">
              {lead.status}
            </Badge>
            <Badge variant="outline">Score {lead.score}</Badge>
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {lead.phone}
            {lead.email ? ` · ${lead.email}` : ""}
            {lead.utmSource ? ` · utm: ${lead.utmSource}` : ""}
          </p>
          {lead.message && (
            <p className="mt-3 max-w-xl rounded-lg bg-white p-3 text-sm border border-stone-200">
              {lead.message}
            </p>
          )}
        </div>
        <LeadDetailActions
          leadId={lead.id}
          status={lead.status}
          team={team}
          assignedToUserId={lead.assignedToUserId}
          phone={lead.phone}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-serif text-xl">Journey timeline</h2>
          <ol className="mt-4 space-y-3">
            {events.map((e) => (
              <li key={e.id} className="border-l-2 border-teal-700/30 pl-3 text-sm">
                <p className="font-medium capitalize">{e.eventType.replaceAll("_", " ")}</p>
                <p className="text-stone-500">
                  {e.pagePath || "—"} · {e.createdAt.toLocaleString("en-IN")}
                </p>
              </li>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-stone-500">No journey events linked yet.</p>
            )}
          </ol>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-serif text-xl">Notes</h2>
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-stone-50 p-3 text-sm">
                <p>{n.body}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {n.createdAt.toLocaleString("en-IN")}
                </p>
              </li>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-stone-500">No notes yet.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
