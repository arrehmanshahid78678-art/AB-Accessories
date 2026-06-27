import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/data";

function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    facebook:
      "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z",
    instagram:
      "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38 3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.24a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm0 10.88a4.28 4.28 0 1 1 0-8.56 4.28 4.28 0 0 1 0 8.56zm6.85-11.13a1.54 1.54 0 1 1-3.08 0 1.54 1.54 0 0 1 3.08 0z",
    twitter:
      "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z",
    youtube:
      "M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
    tiktok:
      "M16.5 2h-3v13.2a2.3 2.3 0 1 1-2.3-2.3c.23 0 .46.03.6.1V9.9a5.3 5.3 0 1 0 4.7 5.3V8.6a6.7 6.7 0 0 0 3.9 1.25V6.8a3.7 3.7 0 0 1-3.9-3.7V2z",
  };
  const d = paths[name] ?? paths.facebook;
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { name: "facebook", url: settings.social?.facebook },
    { name: "instagram", url: settings.social?.instagram },
    { name: "twitter", url: settings.social?.twitter },
    { name: "youtube", url: settings.social?.youtube },
    { name: "tiktok", url: settings.social?.tiktok },
  ].filter((s) => s.url);

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <Image src={settings.logoUrl} alt={settings.logoText} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-sm font-black text-white">
                AB
              </span>
            )}
            <span className="text-lg font-extrabold text-white">{settings.logoText}</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Your trusted store for premium mobile accessories. Genuine products, fair prices and
            fast delivery nationwide.
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-brand-600 hover:text-white"
                  aria-label={s.name}
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          )}
        </div>

        {settings.footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">{group.title}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {group.links.map((l) => (
                <li key={l.label + l.url}>
                  <Link href={l.url} className="text-slate-400 transition hover:text-brand-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Get in touch</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a href={`tel:${settings.phone}`} className="flex items-start gap-2 text-slate-400 hover:text-brand-300">
                <Phone size={16} className="mt-0.5 shrink-0" /> {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-start gap-2 text-slate-400 hover:text-brand-300">
                <Mail size={16} className="mt-0.5 shrink-0" /> {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-slate-400">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {settings.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span>Cash on Delivery available</span>
            <span className="h-3 w-px bg-slate-700" />
            <Link href="/admin" className="hover:text-brand-300">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
