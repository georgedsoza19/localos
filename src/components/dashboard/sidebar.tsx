"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Megaphone,
  Globe,
  UserPlus,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
  { href: "/dashboard/catalog", label: "Catalog", icon: Package },
  { href: "/dashboard/leads", label: "Leads CRM", icon: Users },
  { href: "/dashboard/offers", label: "Offers", icon: Megaphone },
  { href: "/dashboard/site", label: "Microsite", icon: Globe },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: UserPlus },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  orgName,
  orgSlug,
}: {
  orgName: string;
  orgSlug: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-teal-900/10 bg-[#0B3D3A] text-teal-50">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-serif text-2xl tracking-tight text-amber-100">LocalOS</p>
        <p className="mt-1 truncate text-xs text-teal-200/80">{orgName}</p>
        <Link
          href={`/s/${orgSlug}`}
          target="_blank"
          className="mt-2 inline-block text-[11px] text-amber-200/90 underline-offset-2 hover:underline"
        >
          View live site →
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-white/15 text-white"
                  : "text-teal-100/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-teal-100/70 hover:bg-white/10"
        onClick={async () => {
          await authClient.signOut();
          router.push("/login");
        }}
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </aside>
  );
}
