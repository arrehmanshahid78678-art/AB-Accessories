import { db } from "@/db";
import {
  products,
  categories,
  productImages,
  orders,
  settings,
  visitors,
} from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { ensureDatabaseReady } from "@/lib/bootstrap";
import { toNumber } from "@/lib/utils";
import type {
  FooterLinkGroup,
  ProductSpecifications,
  SocialLinks,
} from "@/db/schema";

/* -------------------------------------------------------------------------- */
/*  Domain types                                                              */
/* -------------------------------------------------------------------------- */

export type Product = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  specifications: ProductSpecifications | null;
  categoryId: number | null;
  brand: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  enabled: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

export type SiteSettings = {
  id: number;
  siteName: string;
  logoText: string;
  logoUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  heroCtaText: string;
  primaryColor: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  social: SocialLinks;
  footerLinks: FooterLinkGroup[];
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
};

export type OrderRow = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  items: { productId: number; title: string; image?: string | null; price: number; quantity: number }[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  note: string | null;
  createdAt: Date;
};

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SOCIAL: SocialLinks = {
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  twitter: "https://twitter.com",
  youtube: "https://youtube.com",
};

export const DEFAULT_FOOTER: FooterLinkGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", url: "/products" },
      { label: "Chargers", url: "/category/chargers" },
      { label: "Earbuds", url: "/category/earbuds" },
      { label: "Power Banks", url: "/category/power-banks" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", url: "/about" },
      { label: "Contact", url: "/contact" },
      { label: "Track Order", url: "/track-order" },
      { label: "Admin Login", url: "/admin" },
    ],
  },
];

function normalizeFooterLinks(groups: FooterLinkGroup[]): FooterLinkGroup[] {
  return groups.map((group) => ({
    ...group,
    links: group.links.map((link) =>
      link.label.toLowerCase().includes("admin") || link.url === "/login"
        ? { ...link, url: "/admin" }
        : link,
    ),
  }));
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  siteName: "AB Accessories",
  logoText: "AB Accessories",
  logoUrl: null,
  heroTitle: "Premium Mobile Accessories, Delivered Fast",
  heroSubtitle:
    "Shop chargers, earbuds, power banks and more — genuine products at unbeatable prices with fast nationwide delivery.",
  heroImage: "/images/hero.jpg",
  heroCtaText: "Shop Now",
  primaryColor: "#7c3aed",
  phone: "+92 300 1234567",
  email: "info@abaccessories.com",
  address: "Main Boulevard, Lahore, Pakistan",
  whatsapp: "923001234567",
  social: DEFAULT_SOCIAL,
  footerLinks: DEFAULT_FOOTER,
  currency: "Rs.",
  shippingFee: 150,
  freeShippingThreshold: 5000,
};

/* -------------------------------------------------------------------------- */
/*  Mappers                                                                   */
/* -------------------------------------------------------------------------- */

type ProductDB = typeof products.$inferSelect;

function mapProduct(row: ProductDB, images: string[]): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    specifications: (row.specifications ?? null) as ProductSpecifications | null,
    categoryId: row.categoryId,
    brand: row.brand,
    price: toNumber(row.price),
    salePrice: row.salePrice == null ? null : toNumber(row.salePrice),
    stock: row.stock,
    rating: toNumber(row.rating, 4.5),
    reviewCount: row.reviewCount,
    featured: row.featured,
    enabled: row.enabled,
    images,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
  };
}

function mapOrder(row: typeof orders.$inferSelect): OrderRow {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    items: row.items ?? [],
    itemCount: row.itemCount,
    subtotal: toNumber(row.subtotal),
    shipping: toNumber(row.shipping),
    total: toNumber(row.total),
    status: row.status,
    paymentMethod: row.paymentMethod,
    note: row.note,
    createdAt: row.createdAt,
  };
}

async function attachImages(ids: number[]): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.position), asc(productImages.id));
  for (const r of rows) {
    const arr = map.get(r.productId) ?? [];
    arr.push(r.url);
    map.set(r.productId, arr);
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/*  Settings                                                                  */
/* -------------------------------------------------------------------------- */

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(settings).limit(1);
  const row = rows[0];
  if (!row) return DEFAULT_SETTINGS;
  return {
    id: row.id,
    siteName: row.siteName ?? DEFAULT_SETTINGS.siteName,
    logoText: row.logoText ?? DEFAULT_SETTINGS.logoText,
    logoUrl: row.logoUrl,
    heroTitle: row.heroTitle ?? DEFAULT_SETTINGS.heroTitle,
    heroSubtitle: row.heroSubtitle ?? DEFAULT_SETTINGS.heroSubtitle,
    heroImage: row.heroImage ?? DEFAULT_SETTINGS.heroImage,
    heroCtaText: row.heroCtaText ?? DEFAULT_SETTINGS.heroCtaText,
    primaryColor: row.primaryColor ?? DEFAULT_SETTINGS.primaryColor,
    phone: row.phone ?? DEFAULT_SETTINGS.phone,
    email: row.email ?? DEFAULT_SETTINGS.email,
    address: row.address ?? DEFAULT_SETTINGS.address,
    whatsapp: row.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    social: (row.social ?? DEFAULT_SOCIAL) as SocialLinks,
    footerLinks: normalizeFooterLinks((row.footerLinks ?? DEFAULT_FOOTER) as FooterLinkGroup[]),
    currency: row.currency ?? DEFAULT_SETTINGS.currency,
    shippingFee: toNumber(row.shippingFee, DEFAULT_SETTINGS.shippingFee),
    freeShippingThreshold: toNumber(
      row.freeShippingThreshold,
      DEFAULT_SETTINGS.freeShippingThreshold,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function countProductsByCategory(): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: products.categoryId, count: count() })
    .from(products)
    .where(eq(products.enabled, true))
    .groupBy(products.categoryId);
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.categoryId != null) map.set(r.categoryId, Number(r.count));
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

type ProductQueryOpts = {
  categoryId?: number;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  includeDisabled?: boolean;
  inStockOnly?: boolean;
};

function buildWhere(opts: ProductQueryOpts): SQL | undefined {
  const conds: SQL[] = [];
  if (!opts.includeDisabled) conds.push(eq(products.enabled, true));
  if (opts.categoryId) conds.push(eq(products.categoryId, opts.categoryId));
  if (opts.featured) conds.push(eq(products.featured, true));
  if (opts.inStockOnly) conds.push(sql`${products.stock} > 0`);
  if (opts.search) {
    const term = `%${opts.search}%`;
    conds.push(
      or(
        ilike(products.title, term),
        ilike(products.brand, term),
        ilike(products.description, term),
      )!,
    );
  }
  return conds.length ? and(...conds) : undefined;
}

export async function getProducts(opts: ProductQueryOpts = {}): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(buildWhere(opts))
    .orderBy(desc(products.createdAt))
    .limit(opts.limit ?? 60)
    .offset(opts.offset ?? 0);
  const imgMap = await attachImages(rows.map((r) => r.id));
  return rows.map((r) => mapProduct(r, imgMap.get(r.id) ?? []));
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getProducts({ featured: true, limit });
}

export async function getLatestProducts(limit = 8): Promise<Product[]> {
  return getProducts({ limit });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const imgMap = await attachImages([row.id]);
  return mapProduct(row, imgMap.get(row.id) ?? []);
}

export async function getProductById(id: number): Promise<Product | null> {
  await ensureDatabaseReady();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const imgMap = await attachImages([row.id]);
  return mapProduct(row, imgMap.get(row.id) ?? []);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const list = await getProducts({ categoryId: product.categoryId ?? undefined, limit: limit + 1 });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function searchProducts(term: string, limit = 24): Promise<Product[]> {
  return getProducts({ search: term, limit });
}

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */

export async function getOrders(limit = 50): Promise<OrderRow[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  return rows.map(mapOrder);
}

export async function getOrderById(id: number): Promise<OrderRow | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ? mapOrder(rows[0]) : null;
}

/* -------------------------------------------------------------------------- */
/*  Stats                                                                     */
/* -------------------------------------------------------------------------- */

export type Stats = {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  visitors: number;
  pendingOrders: number;
  lowStock: number;
};

export async function getStats(): Promise<Stats> {
  const [productRows, orderRows, visitorRows, pendingRows, lowStockRows, revenueRows] =
    await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(visitors),
      db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
      db.select({ value: count() }).from(products).where(sql`${products.stock} <= 5`),
      db
        .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders)
        .where(ne(orders.status, "cancelled")),
    ]);

  return {
    totalProducts: Number(productRows[0]?.value ?? 0),
    totalOrders: Number(orderRows[0]?.value ?? 0),
    revenue: toNumber(revenueRows[0]?.total ?? 0),
    visitors: Number(visitorRows[0]?.value ?? 0),
    pendingOrders: Number(pendingRows[0]?.value ?? 0),
    lowStock: Number(lowStockRows[0]?.value ?? 0),
  };
}

/* -------------------------------------------------------------------------- */
/*  Visitors                                                                  */
/* -------------------------------------------------------------------------- */

export async function recordVisitor(sessionId: string, path: string): Promise<void> {
  try {
    await ensureDatabaseReady();
    await db.insert(visitors).values({ sessionId, path });
  } catch {
    // Visitor tracking is best-effort; never fail the request.
  }
}
