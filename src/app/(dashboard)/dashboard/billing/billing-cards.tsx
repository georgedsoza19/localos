"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { PlanId } from "@/lib/plans";

export function BillingCards({
  currentPlan,
  plans,
}: {
  currentPlan: string;
  plans: {
    id: PlanId;
    name: string;
    priceInr: number;
    storeLimit: number;
    leadLimit: number;
    description: string;
  }[];
}) {
  const router = useRouter();

  async function upgrade(planId: PlanId) {
    if (planId === "free") {
      const res = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "free" }),
      });
      if (res.ok) {
        toast.success("On Free plan");
        router.refresh();
      }
      return;
    }

    const orderRes = await fetch("/api/billing/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await orderRes.json();

    if (data.mock) {
      const confirm = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, razorpayPaymentId: `mock_${Date.now()}` }),
      });
      if (confirm.ok) {
        toast.success(`Upgraded to ${planId} (mock — add Razorpay keys for live payments)`);
        router.refresh();
      }
      return;
    }

    toast.message("Razorpay checkout", {
      description: "Open Razorpay Checkout with the returned order in production.",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((p) => (
        <Card key={p.id} className="border-stone-200 shadow-none">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">{p.name}</CardTitle>
            <p className="text-sm text-stone-600">{p.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-3xl">
              ₹{p.priceInr}
              <span className="text-base text-stone-500">/mo</span>
            </p>
            <ul className="space-y-1 text-sm text-stone-600">
              <li>{p.storeLimit} stores</li>
              <li>{p.leadLimit.toLocaleString("en-IN")} leads/month</li>
            </ul>
            <Button
              className="w-full bg-teal-800"
              disabled={currentPlan === p.id}
              onClick={() => upgrade(p.id)}
            >
              {currentPlan === p.id ? "Current plan" : p.priceInr === 0 ? "Downgrade" : "Upgrade"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
