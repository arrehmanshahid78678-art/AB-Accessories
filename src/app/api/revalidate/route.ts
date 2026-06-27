import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Emergency cache-busting endpoint.
 * GET /api/revalidate?t=timestamp
 *
 * Call this from the admin panel before navigating to the storefront
 * to guarantee fresh data. Vercel-safe.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const targetPath = url.searchParams.get("path") || "/";

    // Aggressive revalidation
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath(targetPath, "page");
    revalidatePath(targetPath, "layout");
    revalidatePath("/products", "page");
    revalidatePath("/products", "layout");
    revalidatePath("/products/[slug]", "page");

    revalidateTag("products", "max");
    revalidateTag("categories", "max");
    revalidateTag("settings", "max");
    revalidateTag("orders", "max");
    revalidateTag("storefront", "max");
    revalidateTag("all", "max");

    return new Response(
      JSON.stringify({
        ok: true,
        revalidated: true,
        timestamp: Date.now(),
        paths: ["/", targetPath, "/products"],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Prevent caching of this response itself
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
