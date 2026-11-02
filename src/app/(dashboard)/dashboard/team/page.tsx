import { eq } from "drizzle-orm";
import { requireOrg, getOrgStores } from "@/lib/session";
import { db } from "@/db";
import { invitations, memberships, users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { TeamInviteForm } from "./team-invite";

export default async function TeamPage() {
  const { organization } = await requireOrg();
  const storeList = await getOrgStores(organization.id);
  const members = await db
    .select({
      id: memberships.id,
      role: memberships.role,
      storeId: memberships.storeId,
      name: users.name,
      email: users.email,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.organizationId, organization.id));

  const invites = await db
    .select()
    .from(invitations)
    .where(eq(invitations.organizationId, organization.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Team</h1>
        <p className="mt-1 text-sm text-stone-600">
          Invite brand managers, store managers, and staff with store-scoped access.
        </p>
      </div>

      <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-stone-500">{m.email}</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {m.role.replace("_", " ")}
            </Badge>
          </li>
        ))}
      </ul>

      <TeamInviteForm stores={storeList.map((s) => ({ id: s.id, name: s.name }))} />

      {invites.filter((i) => !i.accepted).length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-medium">Pending invites</h2>
          <ul className="mt-2 space-y-1 text-sm text-stone-600">
            {invites
              .filter((i) => !i.accepted)
              .map((i) => (
                <li key={i.id}>
                  {i.email} · {i.role} · /signup?invite={i.token}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
