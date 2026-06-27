import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const name = settings?.siteName ?? "AB Accessories";
  const description =
    settings?.heroSubtitle ??
    "Premium mobile accessories — chargers, earbuds, power banks and more.";
  return {
    title: { default: `${name} — Premium Mobile Accessories`, template: `%s · ${name}` },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: {
      title: `${name} — Premium Mobile Accessories`,
      description,
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings().catch(() => null);
  const brand = settings?.primaryColor ?? "#7c3aed";
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `:root{--brand:${brand}}` }} />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
