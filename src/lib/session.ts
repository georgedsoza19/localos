import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { memberships, organizations, stores } from "@/db/schema";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function getUserOrg(userId: string) {
  const rows = await db
    .select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function requireOrg() {
  const session = await requireSession();
  const ctx = await getUserOrg(session.user.id);
  if (!ctx) redirect("/dashboard/onboarding");
  return { session, ...ctx };
}

export async function getOrgStores(organizationId: string) {
  return db
    .select()
    .from(stores)
    .where(eq(stores.organizationId, organizationId));
}

export async function assertStoreAccess(
  organizationId: string,
  storeId: string | null | undefined,
  membershipStoreId: string | null,
) {
  if (!storeId) return true;
  if (membershipStoreId && membershipStoreId !== storeId) return false;
  const [store] = await db
    .select()
    .from(stores)
    .where(
      and(eq(stores.id, storeId), eq(stores.organizationId, organizationId)),
    )
    .limit(1);
  return Boolean(store);
}
