import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/session";
import { PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const { organization } = await requireOrg();
  const { planId } = (await req.json()) as { planId: PlanId };
  const plan = PLANS[planId];
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({
      mock: true,
      message:
        "Razorpay keys not configured. Upgrade will be simulated for free-tier setup.",
      planId: plan.id,
      organizationId: organization.id,
      amount: plan.priceInr * 100,
    });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: plan.priceInr * 100,
      currency: "INR",
      receipt: `localos_${organization.id}_${plan.id}`,
      notes: { organizationId: organization.id, planId: plan.id },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: 400 });
  }
  return NextResponse.json({ order: data, planId: plan.id, keyId });
}
