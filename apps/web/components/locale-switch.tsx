"use client";

import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Meta");

  return (
    <nav aria-label={t("language")} className="caps flex shrink-0 items-center gap-2 text-xs">
      {routing.locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span aria-hidden className="text-rule-strong">
              /
            </span>
          )}
          {l === locale ? (
            <span aria-current="true" className="text-ink">
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={l}
              hrefLang={l}
              lang={l}
              className="text-ink-faint transition-colors hover:text-ink"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
