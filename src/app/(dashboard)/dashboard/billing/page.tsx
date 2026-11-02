import { requireOrg } from "@/lib/session";
import { PLANS } from "@/lib/plans";
import { BillingCards } from "./billing-cards";

export default async function BillingPage() {
  const { organization } = await requireOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Billing</h1>
        <p className="mt-1 text-sm text-stone-600">
          Current plan: <strong className="capitalize">{organization.plan}</strong> ·{" "}
          {organization.storeLimit} stores · {organization.leadLimit} leads/month
        </p>
      </div>
      <BillingCards
        currentPlan={organization.plan}
        plans={Object.values(PLANS)}
      />
    </div>
  );
}
