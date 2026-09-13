import { z } from "zod";

export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A value stored once per locale: `{ tr: T, en: T }`. */
export type Localized<T> = Record<Locale, T>;

export function localized<T extends z.ZodType>(schema: T) {
  return z.object({ tr: schema, en: schema });
}

/** Localized plain text. Empty string means "not translated yet". */
export const localizedText = localized(z.string().trim().max(5000));
export const emptyLocalizedText = (): Localized<string> => ({ tr: "", en: "" });

function isFilled(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (value && typeof value === "object") return Object.values(value).some(isFilled);
  return value != null;
}

/**
 * Returns the value for `locale`, falling back to the other locale when the
 * requested one was never filled in, so a missing translation never renders blank.
 */
export function pickLocale<T>(
  value: Localized<T> | null | undefined,
  locale: Locale,
): T | undefined {
  if (!value) return undefined;
  const own = value[locale];
  if (isFilled(own)) return own;
  const other = locales.find((l) => l !== locale);
  return other ? value[other] : own;
}
