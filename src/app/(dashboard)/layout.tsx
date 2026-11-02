import { getSession, getUserOrg } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const ctx = await getUserOrg(session.user.id);

  return (
    <div className="flex min-h-screen bg-[#F7F3EC]">
      {ctx ? (
        <DashboardSidebar
          orgName={ctx.organization.name}
          orgSlug={ctx.organization.slug}
        />
      ) : (
        <aside className="flex w-60 flex-col border-r border-teal-900/10 bg-[#0B3D3A] px-5 py-5 text-teal-50">
          <p className="font-serif text-2xl text-amber-100">LocalOS</p>
          <p className="mt-2 text-xs text-teal-200/80">Complete setup to unlock the dashboard</p>
        </aside>
      )}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
