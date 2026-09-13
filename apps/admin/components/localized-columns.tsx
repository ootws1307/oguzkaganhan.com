import type { Locale } from "@repo/content";
import type { ReactNode } from "react";

const LOCALES: { locale: Locale; label: string }[] = [
  { locale: "tr", label: "Türkçe" },
  { locale: "en", label: "English" },
];

/**
 * Turkish and English side by side so a translation is written against its
 * source. A locale left empty is marked in redline: the site will fall back to
 * the other language there.
 */
export function LocalizedColumns({
  missing,
  children,
}: {
  missing?: Partial<Record<Locale, boolean>>;
  children: (locale: Locale) => ReactNode;
}) {
  return (
    <div className="grid gap-x-8 gap-y-8 xl:grid-cols-2">
      {LOCALES.map(({ locale, label }) => (
        <fieldset key={locale} lang={locale} className="min-w-0 space-y-5">
          <legend className="caps mb-4 flex w-full items-baseline justify-between border-b border-ink pb-2 text-sm">
            <span>{label}</span>
            {missing?.[locale] && (
              <span className="text-xs text-redline">Boş: diğer dil gösterilir</span>
            )}
          </legend>
          {children(locale)}
        </fieldset>
      ))}
    </div>
  );
}
