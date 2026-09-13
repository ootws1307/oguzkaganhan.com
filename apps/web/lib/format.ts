import type { Locale } from "@repo/content";

const DAY = 86_400_000;

/** "3 gün önce" / "3 days ago", in the largest unit that is at least 1. */
export function relativeTime(iso: string, locale: Locale, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < DAY) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / DAY), "day");
  if (abs < 365 * DAY) return rtf.format(Math.round(diff / (30 * DAY)), "month");
  return rtf.format(Math.round(diff / (365 * DAY)), "year");
}

/** A push within the last two weeks counts as a fresh revision (drawn in redline). */
export function isRecent(iso: string | null, now = Date.now()): boolean {
  return !!iso && now - new Date(iso).getTime() < 14 * DAY;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Sheet numbers as a drawing set writes them: 03/06. */
export function sheetNo(n: number, total: number): string {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(n)}/${pad(total)}`;
}

/** Project drawing number: P-03. */
export function projectNo(n: number): string {
  return `P-${String(n).padStart(2, "0")}`;
}

export function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("tr");
}
