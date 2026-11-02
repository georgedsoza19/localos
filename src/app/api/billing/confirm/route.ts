import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireOrg } from "@/lib/session";
import { PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const { organization } = await requireOrg();
  const body = (await req.json()) as {
    planId: PlanId;
    razorpayPaymentId?: string;
  };
  const plan = PLANS[body.planId];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await db
    .update(organizations)
    .set({
      plan: plan.id,
      storeLimit: plan.storeLimit,
      leadLimit: plan.leadLimit,
      razorpaySubscriptionId: body.razorpayPaymentId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organization.id));

  return NextResponse.json({ ok: true, plan: plan.id });
}
