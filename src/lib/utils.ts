export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export function formatPrice(
  value: number | string | null | undefined,
  currency = "Rs.",
): string {
  const n = toNumber(value);
  return `${currency} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function discountPercent(
  price: number,
  salePrice?: number | null,
): number | null {
  if (!salePrice || salePrice >= price || salePrice <= 0) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

export function effectivePrice(
  price: number,
  salePrice?: number | null,
): number {
  if (salePrice && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function genOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `AB-${stamp}${rand}`;
}
