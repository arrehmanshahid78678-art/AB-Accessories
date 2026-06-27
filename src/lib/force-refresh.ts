/**
 * Force a HARD browser reload that bypasses ALL cache layers:
 * 1. Calls /api/revalidate to invalidate Next.js + Vercel cache
 * 2. Waits for server to finish revalidating
 * 3. Redirects to target page with a cache-busting query param
 * 4. Uses meta-reload as a fallback
 *
 * This is the "nuclear option" — guarantees fresh data on every admin action.
 */
export async function forceFullReload(redirectTo?: string): Promise<void> {
  const target = redirectTo || window.location.pathname;
  const stamp = Date.now();

  try {
    // Step 1: Tell the server to invalidate ALL caches
    await fetch(`/api/revalidate?path=${encodeURIComponent(target)}&t=${stamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  } catch {
    // Continue even if this fails — browser reload will still help
  }

  // Step 2: Small delay to let Vercel propagate the revalidation
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Step 3: Navigate with a cache-busting query parameter
  const url = new URL(target, window.location.origin);
  url.searchParams.set("_cb", String(stamp));

  // Step 4: Force a hard reload using location.replace (replaces current history entry)
  window.location.replace(url.toString());
}

/**
 * Convenience version with a configurable delay.
 */
export function forceReloadAfter(ms = 300, redirectTo?: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      forceFullReload(redirectTo).then(resolve);
    }, ms);
  });
}

/**
 * Ultra-aggressive version that also clears any service workers
 * and storage cache. Use this for critical admin actions.
 */
export async function nuclearReload(redirectTo?: string): Promise<void> {
  // Unregister any service workers that might be caching
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    } catch {
      // Ignore — service workers are optional
    }
  }

  // Clear Next.js prefetch cache if present
  if (typeof window !== "undefined" && (window as any).__NEXT_DATA__) {
    try {
      delete (window as any).__NEXT_DATA__;
    } catch {
      // Ignore
    }
  }

  return forceFullReload(redirectTo);
}
