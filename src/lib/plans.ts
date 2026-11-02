export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    priceInr: 0,
    storeLimit: 1,
    leadLimit: 100,
    description: "1 store, 100 leads/month — perfect to pilot.",
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    priceInr: 999,
    storeLimit: 3,
    leadLimit: 1000,
    description: "3 stores, 1,000 leads/month, email alerts.",
  },
  growth: {
    id: "growth" as const,
    name: "Growth",
    priceInr: 2999,
    storeLimit: 10,
    leadLimit: 5000,
    description: "10 stores, 5,000 leads/month, priority support.",
  },
};

export type PlanId = keyof typeof PLANS;
