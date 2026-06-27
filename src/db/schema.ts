import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Shared JSONB value types                                                  */
/* -------------------------------------------------------------------------- */

export type ProductSpecifications = {
  compatibility?: string;
  material?: string;
  color?: string;
  chargingSpeed?: string;
  cableLength?: string;
  warranty?: string;
  features?: string[];
};

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
};

export type FooterLink = { label: string; url: string };
export type FooterLinkGroup = { title: string; links: FooterLink[] };

export type OrderItem = {
  productId: number;
  title: string;
  image?: string | null;
  price: number;
  quantity: number;
};

/* -------------------------------------------------------------------------- */
/*  Tables                                                                    */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    specifications: jsonb("specifications").$type<ProductSpecifications>(),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    brand: text("brand"),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    salePrice: decimal("sale_price", { precision: 12, scale: 2 }),
    stock: integer("stock").default(0).notNull(),
    rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    featured: boolean("featured").default(false).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_featured_idx").on(t.featured),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  itemCount: integer("item_count").default(0).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 12, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method").default("cod").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("AB Accessories").notNull(),
  logoText: text("logo_text").default("AB Accessories").notNull(),
  logoUrl: text("logo_url"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  heroImage: text("hero_image"),
  heroCtaText: text("hero_cta_text").default("Shop Now"),
  primaryColor: text("primary_color").default("#7c3aed"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  whatsapp: text("whatsapp"),
  social: jsonb("social").$type<SocialLinks>(),
  footerLinks: jsonb("footer_links").$type<FooterLinkGroup[]>(),
  currency: text("currency").default("Rs.").notNull(),
  shippingFee: decimal("shipping_fee", { precision: 12, scale: 2 }).default("150").notNull(),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 12, scale: 2 })
    .default("5000")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  path: text("path"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* -------------------------------------------------------------------------- */
/*  Relations                                                                 */
/* -------------------------------------------------------------------------- */

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
