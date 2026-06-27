import { db } from "@/db";
import { sql } from "drizzle-orm";

let bootstrapPromise: Promise<void> | null = null;

async function exec(statement: string): Promise<void> {
  await db.execute(sql.raw(statement));
}

async function runBootstrap(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      specifications JSONB,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand TEXT,
      price NUMERIC(12, 2) NOT NULL,
      sale_price NUMERIC(12, 2),
      stock INTEGER NOT NULL DEFAULT 0,
      rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
      review_count INTEGER NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT false,
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      city TEXT,
      items JSONB NOT NULL,
      item_count INTEGER NOT NULL DEFAULT 0,
      subtotal NUMERIC(12, 2) NOT NULL,
      shipping NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total NUMERIC(12, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      site_name TEXT NOT NULL DEFAULT 'AB Accessories',
      logo_text TEXT NOT NULL DEFAULT 'AB Accessories',
      logo_url TEXT,
      hero_title TEXT,
      hero_subtitle TEXT,
      hero_image TEXT,
      hero_cta_text TEXT DEFAULT 'Shop Now',
      primary_color TEXT DEFAULT '#7c3aed',
      phone TEXT,
      email TEXT,
      address TEXT,
      whatsapp TEXT,
      social JSONB,
      footer_links JSONB,
      currency TEXT NOT NULL DEFAULT 'Rs.',
      shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 150,
      free_shipping_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5000,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      session_id TEXT,
      path TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await Promise.all([
    exec("CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);") ,
    exec("CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);") ,
    exec("CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);") ,
    exec("CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);") ,
    exec("CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id);") ,
  ]);
}

/**
 * Ensures the PostgreSQL schema exists before the app reads/writes data.
 * This makes the admin panel open reliably even on a fresh Neon database or
 * a newly rebuilt preview where migrations were not pushed manually yet.
 */
export async function ensureDatabaseReady(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
