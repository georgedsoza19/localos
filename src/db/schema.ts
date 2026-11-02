import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("member_role", [
  "owner",
  "brand_manager",
  "store_manager",
  "staff",
]);

export const templateEnum = pgEnum("site_template", [
  "clinic",
  "salon",
  "retail",
]);

export const leadChannelEnum = pgEnum("lead_channel", [
  "form",
  "whatsapp",
  "call",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
]);

export const planEnum = pgEnum("plan_tier", ["free", "starter", "growth"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  tagline: text("tagline"),
  primaryColor: text("primary_color").default("#0F766E"),
  secondaryColor: text("secondary_color").default("#134E4A"),
  industry: templateEnum("industry").default("retail"),
  socialInstagram: text("social_instagram"),
  socialFacebook: text("social_facebook"),
  socialYoutube: text("social_youtube"),
  plan: planEnum("plan").notNull().default("free"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  leadLimit: integer("lead_limit").notNull().default(100),
  storeLimit: integer("store_limit").notNull().default(1),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull().default("staff"),
    storeId: text("store_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("membership_org_user").on(t.organizationId, t.userId)],
);

export const stores = pgTable(
  "stores",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),
    mapsUrl: text("maps_url"),
    hours: jsonb("hours").$type<Record<string, { open: string; close: string; closed?: boolean }>>(),
    servicePincodes: jsonb("service_pincodes").$type<string[]>().default([]),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    previewToken: text("preview_token"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("store_org_slug").on(t.organizationId, t.slug),
    index("store_org_idx").on(t.organizationId),
  ],
);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }),
  fromPrice: boolean("from_price").notNull().default(false),
  images: jsonb("images").$type<string[]>().default([]),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storeProducts = pgTable(
  "store_products",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    available: boolean("available").notNull().default(true),
    priceOverride: numeric("price_override", { precision: 12, scale: 2 }),
  },
  (t) => [uniqueIndex("store_product_uniq").on(t.storeId, t.productId)],
);

export const offers = pgTable("offers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  storeId: text("store_id").references(() => stores.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  bannerImage: text("banner_image"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteConfigs = pgTable("site_configs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  storeId: text("store_id").references(() => stores.id, { onDelete: "cascade" }),
  template: templateEnum("template").notNull().default("retail"),
  headline: text("headline"),
  subheadline: text("subheadline"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  stickyCall: boolean("sticky_call").notNull().default(true),
  stickyWhatsapp: boolean("sticky_whatsapp").notNull().default(true),
  stickyEnquire: boolean("sticky_enquire").notNull().default(true),
  content: jsonb("content").$type<{
    testimonials?: { name: string; quote: string; rating?: number }[];
    faq?: { q: string; a: string }[];
    gallery?: string[];
    team?: { name: string; role: string; image?: string }[];
  }>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    channel: leadChannelEnum("channel").notNull(),
    status: leadStatusEnum("status").notNull().default("new"),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    message: text("message"),
    consent: boolean("consent").notNull().default(false),
    visitorId: text("visitor_id"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    landingPage: text("landing_page"),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    followUpAt: timestamp("follow_up_at"),
    score: integer("score").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("leads_org_idx").on(t.organizationId),
    index("leads_store_idx").on(t.storeId),
    index("leads_phone_idx").on(t.phone),
  ],
);

export const journeyEvents = pgTable(
  "journey_events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    storeId: text("store_id"),
    leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),
    visitorId: text("visitor_id").notNull(),
    eventType: text("event_type").notNull(),
    pagePath: text("page_path"),
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("journey_visitor_idx").on(t.visitorId),
    index("journey_lead_idx").on(t.leadId),
  ],
);

export const leadNotes = pgTable("lead_notes", {
  id: text("id").primaryKey(),
  leadId: text("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("staff"),
  storeId: text("store_id"),
  token: text("token").notNull().unique(),
  accepted: boolean("accepted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(sessions),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  stores: many(stores),
  products: many(products),
  leads: many(leads),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [stores.organizationId],
    references: [organizations.id],
  }),
  leads: many(leads),
}));
