"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { leadNotes, leads } from "@/db/schema";
import { id } from "@/lib/ids";
import { requireOrg } from "@/lib/session";

export async function updateLeadStatus(
  leadId: string,
  status: "new" | "contacted" | "qualified" | "won" | "lost",
) {
  const { organization } = await requireOrg();
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(leads.id, leadId), eq(leads.organizationId, organization.id)),
    );
  revalidatePath("/dashboard/leads");
}

export async function assignLead(leadId: string, userId: string | null) {
  const { organization } = await requireOrg();
  await db
    .update(leads)
    .set({ assignedToUserId: userId, updatedAt: new Date() })
    .where(
      and(eq(leads.id, leadId), eq(leads.organizationId, organization.id)),
    );
  revalidatePath("/dashboard/leads");
}

export async function setFollowUp(leadId: string, followUpAt: string | null) {
  const { organization } = await requireOrg();
  await db
    .update(leads)
    .set({
      followUpAt: followUpAt ? new Date(followUpAt) : null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(leads.id, leadId), eq(leads.organizationId, organization.id)),
    );
  revalidatePath("/dashboard/leads");
}

export async function addLeadNote(leadId: string, body: string) {
  const { session, organization } = await requireOrg();
  const [lead] = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.id, leadId), eq(leads.organizationId, organization.id)),
    )
    .limit(1);
  if (!lead) throw new Error("Not found");

  await db.insert(leadNotes).values({
    id: id("note"),
    leadId,
    userId: session.user.id,
    body,
  });
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function mergeLeadsByPhone(phone: string) {
  const { organization } = await requireOrg();
  const rows = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.organizationId, organization.id), eq(leads.phone, phone)),
    );
  if (rows.length < 2) return { merged: 0 };

  const [primary, ...dupes] = rows.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  for (const d of dupes) {
    await db
      .update(leads)
      .set({ status: "lost", message: `Merged into ${primary.id}`, updatedAt: new Date() })
      .where(eq(leads.id, d.id));
  }
  revalidatePath("/dashboard/leads");
  return { merged: dupes.length, primaryId: primary.id };
}
