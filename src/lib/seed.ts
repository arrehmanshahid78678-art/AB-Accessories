import { db } from "@/db";
import { users, categories, products, productImages, settings } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { ensureDatabaseReady } from "@/lib/bootstrap";
import { DEFAULT_FOOTER, DEFAULT_SOCIAL } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { count, eq } from "drizzle-orm";

export const ADMIN_EMAIL = "arrehmanshahid78678@gmail.com";
export const ADMIN_PASSWORD = "mani158";

/**
 * Check if auto-seeding is disabled via environment variable.
 * Set DISABLE_AUTO_SEED=true to prevent automatic seeding on page loads.
 * Admin user and settings will still be created (needed for login).
 */
function isAutoSeedDisabled(): boolean {
  const val = process.env.DISABLE_AUTO_SEED;
  return val === "true" || val === "1" || val === "yes";
}

const SEED_CATEGORIES = [
  {
    name: "Chargers",
    slug: "chargers",
    description: "Fast chargers, GaN adapters and charging cables",
    image: "/images/charger-20w.jpg",
  },
  {
    name: "Earbuds",
    slug: "earbuds",
    description: "True wireless earbuds with charging cases",
    image: "/images/earbuds-white.jpg",
  },
  {
    name: "Power Banks",
    slug: "power-banks",
    description: "Portable power banks for charging on the go",
    image: "/images/powerbank-20k.jpg",
  },
  {
    name: "Handsfree",
    slug: "handsfree",
    description: "Wired earphones with built-in microphone",
    image: "/images/handsfree-wired.jpg",
  },
  {
    name: "Head Phones",
    slug: "head-phones",
    description: "Over-ear and on-ear headphones",
    image: "/images/headphones-overear.jpg",
  },
  {
    name: "Phone Holders",
    slug: "phone-holders",
    description: "Car mounts, desktop stands and grips",
    image: "/images/holder-car-mount.jpg",
  },
];

type SeedProduct = {
  title: string;
  categorySlug: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  images: string[];
  description: string;
  specs: Record<string, string | string[]>;
};

const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: "20W USB-C Fast Charger",
    categorySlug: "chargers",
    brand: "Anker",
    price: 2499,
    salePrice: 1799,
    stock: 64,
    rating: 4.8,
    reviewCount: 214,
    featured: true,
    images: ["/images/charger-20w.jpg"],
    description:
      "Compact 20W USB-C PD wall charger that powers your phone to 50% in just 25 minutes. Includes a durable braided USB-C cable and built-in over-current protection.",
    specs: {
      compatibility: "iPhone, Samsung, Xiaomi & all USB-C devices",
      material: "Fire-retardant PC shell",
      color: "White",
      chargingSpeed: "20W Power Delivery",
      cableLength: "1 metre braided cable",
      warranty: "1 Year Replacement",
      features: ["Over-current protection", "Over-heat protection", "Compact travel size"],
    },
  },
  {
    title: "65W GaN 3-Port Charger",
    categorySlug: "chargers",
    brand: "Baseus",
    price: 4999,
    salePrice: 3999,
    stock: 38,
    rating: 4.9,
    reviewCount: 156,
    featured: true,
    images: ["/images/charger-65w-gan.jpg"],
    description:
      "Next-gen Gallium Nitride charger with two USB-C PD ports and one USB-A port. Charge your laptop, phone and earbuds at the same time without the bulk.",
    specs: {
      compatibility: "MacBook, laptops, phones, tablets",
      material: "Aluminium + matte PC",
      color: "Black",
      chargingSpeed: "65W max (PD 3.0)",
      warranty: "1 Year Warranty",
      features: ["3 ports", "GaN II tech", "Smart power allocation"],
    },
  },
  {
    title: "AirSound Pro Wireless Earbuds",
    categorySlug: "earbuds",
    brand: "SoundPeats",
    price: 3499,
    salePrice: 2499,
    stock: 52,
    rating: 4.7,
    reviewCount: 321,
    featured: true,
    images: ["/images/earbuds-white.jpg"],
    description:
      "True wireless earbuds with crystal-clear sound, ENC microphones for calls and a pocketable charging case giving 30 hours of total playtime.",
    specs: {
      compatibility: "Bluetooth 5.3 — iOS & Android",
      material: "Premium ABS",
      color: "White",
      chargingSpeed: "Type-C fast charge",
      warranty: "6 Months",
      features: ["ENC call noise cancellation", "30h playtime", "Touch controls", "IPX5 sweat resistant"],
    },
  },
  {
    title: "Gaming Buds X Low-Latency Earbuds",
    categorySlug: "earbuds",
    brand: "Redragon",
    price: 4299,
    salePrice: 3499,
    stock: 27,
    rating: 4.6,
    reviewCount: 88,
    images: ["/images/earbuds-black-gaming.jpg"],
    description:
      "Designed for gamers — dual-mode gaming/music tuning with ultra-low 45ms latency, punchy bass and RGB charging case.",
    specs: {
      compatibility: "Bluetooth 5.3",
      material: "Matte finish",
      color: "Black",
      chargingSpeed: "Type-C",
      warranty: "6 Months",
      features: ["45ms gaming mode", "RGB case", "Dual drivers", "IPX4"],
    },
  },
  {
    title: "PowerCore 20000mAh Slim Power Bank",
    categorySlug: "power-banks",
    brand: "Baseus",
    price: 3999,
    salePrice: 3299,
    stock: 45,
    rating: 4.8,
    reviewCount: 192,
    featured: true,
    images: ["/images/powerbank-20k.jpg"],
    description:
      "Slim 20000mAh power bank with a digital battery display and 22.5W fast charging. Charges most phones 4–5 times on a single refill.",
    specs: {
      compatibility: "All USB & USB-C devices",
      material: "Aluminium alloy",
      color: "Black",
      chargingSpeed: "22.5W PD/QC",
      cableLength: "Built-in cables",
      warranty: "1 Year",
      features: ["20000mAh", "Digital display", "Dual input", "Multi-protection"],
    },
  },
  {
    title: "Wired Earphones with Mic",
    categorySlug: "handsfree",
    brand: "Samsung",
    price: 899,
    salePrice: 599,
    stock: 120,
    rating: 4.5,
    reviewCount: 410,
    images: ["/images/handsfree-wired.jpg"],
    description:
      "Lightweight in-ear wired handsfree with an in-line microphone and media controls. Reliable sound for calls and music with zero latency.",
    specs: {
      compatibility: "3.5mm jack devices",
      material: "Tangle-free cable",
      color: "White",
      cableLength: "1.2 metres",
      warranty: "3 Months",
      features: ["In-line mic", "Volume controls", "Ergonomic fit"],
    },
  },
  {
    title: "StudioMax Over-Ear Headphones",
    categorySlug: "head-phones",
    brand: "JBL",
    price: 6999,
    salePrice: 5499,
    stock: 19,
    rating: 4.9,
    reviewCount: 73,
    featured: true,
    images: ["/images/headphones-overear.jpg"],
    description:
      "Premium over-ear wireless headphones with plush memory-foam ear cushions, deep bass and 40 hours of battery life. Foldable for travel.",
    specs: {
      compatibility: "Bluetooth 5.3 + 3.5mm",
      material: "Protein leather + metal",
      color: "Black",
      chargingSpeed: "Type-C",
      warranty: "1 Year",
      features: ["40h battery", "ANC ready", "Foldable design", "Built-in mic"],
    },
  },
  {
    title: "Magnetic Car Phone Mount",
    categorySlug: "phone-holders",
    brand: "Baseus",
    price: 1499,
    salePrice: 1099,
    stock: 70,
    rating: 4.6,
    reviewCount: 165,
    images: ["/images/holder-car-mount.jpg"],
    description:
      "Strong N52 magnetic car mount that clips onto any air vent. Holds your phone firmly even on bumpy roads with one-handed operation.",
    specs: {
      compatibility: "All phones (with metal plate / MagSafe)",
      material: "Aluminium + silicone",
      color: "Black",
      warranty: "6 Months",
      features: ["N52 magnet", "360° rotation", "Vent clip", "No blocking view"],
    },
  },
  {
    title: "Wireless Charging Stand",
    categorySlug: "phone-holders",
    brand: "Anker",
    price: 2999,
    salePrice: 2499,
    stock: 33,
    rating: 4.7,
    reviewCount: 98,
    featured: true,
    images: ["/images/holder-wireless-stand.jpg"],
    description:
      "15W fast wireless charging stand that keeps your phone upright — perfect for video calls and notifications while it charges.",
    specs: {
      compatibility: "Qi-enabled phones",
      material: "Anti-slip silicone base",
      color: "White",
      chargingSpeed: "15W fast wireless",
      warranty: "1 Year",
      features: ["15W output", "Case-friendly", "Vertical & horizontal", "LED indicator"],
    },
  },
  {
    title: "20W Fast Charger Twin Pack",
    categorySlug: "chargers",
    brand: "Anker",
    price: 4499,
    salePrice: 3299,
    stock: 30,
    rating: 4.7,
    reviewCount: 54,
    images: ["/images/charger-20w.jpg"],
    description:
      "Two 20W USB-C fast chargers in one pack — keep one at home and one at the office. Great value with the same fast-charging performance.",
    specs: {
      compatibility: "USB-C devices",
      material: "Fire-retardant PC",
      color: "White",
      chargingSpeed: "20W PD x2",
      cableLength: "Cables sold separately",
      warranty: "1 Year",
      features: ["Pack of 2", "Compact", "Safe charging"],
    },
  },
  {
    title: "AirSound Lite Everyday Earbuds",
    categorySlug: "earbuds",
    brand: "SoundPeats",
    price: 1999,
    salePrice: 1499,
    stock: 88,
    rating: 4.4,
    reviewCount: 207,
    images: ["/images/earbuds-white.jpg"],
    description:
      "Budget-friendly true wireless earbuds with surprisingly rich sound and a comfortable fit. 20 hours total battery with the charging case.",
    specs: {
      compatibility: "Bluetooth 5.1",
      material: "Lightweight ABS",
      color: "White",
      chargingSpeed: "Type-C",
      warranty: "6 Months",
      features: ["20h playtime", "Touch controls", "Lightweight fit"],
    },
  },
  {
    title: "Magnetic Vent Mount Mini",
    categorySlug: "phone-holders",
    brand: "Baseus",
    price: 999,
    salePrice: 699,
    stock: 95,
    rating: 4.5,
    reviewCount: 132,
    images: ["/images/holder-car-mount.jpg"],
    description:
      "Ultra-compact magnetic vent mount — minimal footprint, maximum grip. The perfect affordable phone holder for any car.",
    specs: {
      compatibility: "All phones",
      material: "ABS + magnet",
      color: "Black",
      warranty: "3 Months",
      features: ["Compact", "Strong grip", "Easy install"],
    },
  },
];

export async function ensureSeedData(): Promise<void> {
  await ensureDatabaseReady();

  /* Settings ------------------------------------------------------------- */
  const settingsRows = await db.select().from(settings).limit(1);
  if (settingsRows.length === 0) {
    await db.insert(settings).values({
      siteName: "AB Accessories",
      logoText: "AB Accessories",
      heroTitle: "Premium Mobile Accessories, Delivered Fast",
      heroSubtitle:
        "Shop chargers, earbuds, power banks and more — genuine products at unbeatable prices with fast nationwide delivery.",
      heroImage: "/images/hero.jpg",
      heroCtaText: "Shop Collection",
      primaryColor: "#7c3aed",
      phone: "+92 300 1234567",
      email: "info@abaccessories.com",
      address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
      whatsapp: "923001234567",
      social: DEFAULT_SOCIAL,
      footerLinks: DEFAULT_FOOTER,
      currency: "Rs.",
      shippingFee: "150",
      freeShippingThreshold: "5000",
    });
  }

  /* Admin user ----------------------------------------------------------- */
  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      name: "Abdul Rehman",
      email: ADMIN_EMAIL,
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      role: "admin",
    });
  }

  // If auto-seed is disabled, skip categories and products.
  // Admin user and settings are always created (needed for login & site config).
  if (isAutoSeedDisabled()) {
    return;
  }

  // If auto-seed is disabled via env, skip categories and products.
  if (isAutoSeedDisabled()) {
    return;
  }

  // Smart re-seed guard: if the admin has already customized the settings
  // (updatedAt > createdAt), OR the settings row carries a "seed completed"
  // marker, we treat the database as "in use" and DO NOT auto-seed products
  // again — even if the products table is currently empty (e.g., after a
  // manual clear). This prevents the confusing behavior where deleting
  // tables or clearing data causes demo products to magically reappear.
  const [settingsRow] = await db.select().from(settings).limit(1);
  if (settingsRow) {
    const wasCustomized = settingsRow.updatedAt.getTime() > settingsRow.createdAt.getTime() + 1000;
    const seedMarker = (settingsRow.social as any)?.__seedCompleted === true;
    const wasCleared = (settingsRow.social as any)?.__dataClearedAt != null;
    if (wasCustomized || seedMarker || wasCleared) {
      return;
    }
  }

  /* Categories ----------------------------------------------------------- */
  const existingCats = await db.select().from(categories);
  const slugToId = new Map<string, number>();
  if (existingCats.length === 0) {
    const inserted = await db
      .insert(categories)
      .values(SEED_CATEGORIES)
      .returning({ id: categories.id, slug: categories.slug });
    for (const c of inserted) slugToId.set(c.slug, c.id);
  } else {
    for (const c of existingCats) slugToId.set(c.slug, c.id);
  }

  /* Products ------------------------------------------------------------- */
  const [productCountRow] = await db.select({ value: count() }).from(products);
  if (Number(productCountRow?.value ?? 0) === 0) {
    for (const p of SEED_PRODUCTS) {
      const categoryId = slugToId.get(p.categorySlug) ?? null;
      const slug = slugify(p.title);
      const [created] = await db
        .insert(products)
        .values({
          title: p.title,
          slug,
          description: p.description,
          specifications: p.specs,
          categoryId,
          brand: p.brand,
          price: p.price.toFixed(2),
          salePrice: p.salePrice != null ? p.salePrice.toFixed(2) : null,
          stock: p.stock,
          rating: p.rating.toFixed(1),
          reviewCount: p.reviewCount,
          featured: !!p.featured,
          enabled: true,
        })
        .returning({ id: products.id });

      if (created && p.images.length > 0) {
        await db.insert(productImages).values(
          p.images.map((url, idx) => ({
            productId: created.id,
            url,
            position: idx,
          })),
        );
      }
    }
  }

  // Mark seeding as completed so ensureSeedData() won't run again even if
  // tables are later emptied (e.g., by the admin "Clear All Data" action).
  if (settingsRow) {
    const existing = (settingsRow.social as any) ?? {};
    await db
      .update(settings)
      .set({ social: { ...existing, __seedCompleted: true } })
      .where(eq(settings.id, settingsRow.id));
  }
}
