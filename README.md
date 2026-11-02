# LocalOS

India-first hyperlocal omnichannel SaaS for local SMBs: brand/store onboarding, catalogs, industry microsites (Clinic / Salon / Retail), multi-channel lead capture (form / WhatsApp / call), and journey CRM.

## Stack (free-tier friendly)

- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Neon Postgres + Drizzle ORM
- Better Auth (email/password)
- Razorpay-ready billing (mock upgrade without keys)

## Setup

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev
```

Sign up at `/signup`, or open seeded sites:

- `/s/glow-salon`
- `/s/care-clinic`

## Notes

- WhatsApp / call use `wa.me` and `tel:` with tracked lead events.
- Image uploads go to `public/uploads` locally.
- Set Razorpay keys for live checkout; without them, plan upgrades are simulated.
