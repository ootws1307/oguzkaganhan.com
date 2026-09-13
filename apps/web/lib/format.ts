import type { Locale } from "@repo/content";

const DAY = 86_400_000;

/** Work pushed within the last two weeks is the current line of the report. */
export function isRecent(iso: string | null, now = Date.now()): boolean {
  return !!iso && now - new Date(iso).getTime() < 14 * DAY;
}

/** Dates are printed, never described: "11.09.2026", never "2 months ago". */
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
