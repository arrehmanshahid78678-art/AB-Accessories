import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Vercel-optimized revalidation that invalidates ALL cache layers:
 * 1. Next.js internal cache
 * 2. Vercel Edge cache
 * 3. ISR/SSG cache
 */
export async function revalidateStorefront(): Promise<void> {
  try {
    // Revalidate all dynamic routes
    const paths = [
      "/",
      "/products",
      "/admin",
      "/admin/products",
      "/admin/categories",
      "/admin/settings",
      "/admin/orders",
    ];

    // Revalidate each path with both page and layout
    for (const path of paths) {
      revalidatePath(path, "page");
      revalidatePath(path, "layout");
    }

    // Revalidate dynamic routes
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/products/[slug]", "layout");

    // Revalidate all tags (second arg required in Next.js 16)
    revalidateTag("products", "max");
    revalidateTag("categories", "max");
    revalidateTag("settings", "max");
    revalidateTag("orders", "max");
    revalidateTag("storefront", "max");
    revalidateTag("all", "max");

    console.log("[Revalidation] ✅ All caches invalidated");
  } catch (error) {
    console.error("[Revalidation] ❌ Error:", error);
  }
}

/**
 * Revalidate specific product by slug
 */
export async function revalidateProduct(slug: string): Promise<void> {
  try {
    revalidatePath(`/products/${slug}`, "page");
    revalidatePath("/products", "page");
    revalidatePath("/", "page");
    revalidateTag("products", "max");
    revalidateTag("storefront", "max");
    console.log(`[Revalidation] ✅ Product ${slug} invalidated`);
  } catch (error) {
    console.error("[Revalidation] ❌ Error:", error);
  }
}

/**
 * Revalidate specific category by slug
 */
export async function revalidateCategory(slug: string): Promise<void> {
  try {
    revalidatePath(`/products?category=${slug}`, "page");
    revalidatePath("/products", "page");
    revalidatePath("/", "page");
    revalidateTag("categories", "max");
    revalidateTag("storefront", "max");
    console.log(`[Revalidation] ✅ Category ${slug} invalidated`);
  } catch (error) {
    console.error("[Revalidation] ❌ Error:", error);
  }
}
