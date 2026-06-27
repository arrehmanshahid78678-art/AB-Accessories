import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { getCategories, getSettings } from "@/lib/data";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const waNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, "") : "";

  return (
    <>
      <Navbar settings={settings} categories={categories} />
      <main className="min-h-[50vh]">{children}</main>
      <Footer settings={settings} />
      <CartDrawer currency={settings.currency} freeShipThreshold={settings.freeShippingThreshold} />

      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi AB Accessories! I have a question.")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.35.19 1.85.12.56-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.12-.27-.2-.57-.34M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1 14.6-11.7 9.36 9.36 0 0 1 2.83 6.67 9.42 9.42 0 0 1-9.45 9.45M20.5 3.49A11.78 11.78 0 0 0 12.04 0C5.5 0 .15 5.34.15 11.9c0 2.1.55 4.15 1.6 5.96L.05 24l6.3-1.65a11.86 11.86 0 0 0 5.69 1.45h.01c6.54 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.48-8.41" />
          </svg>
        </a>
      )}
    </>
  );
}
