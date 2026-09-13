import type { Metadata } from "next";
import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../styles.css";

// One superfamily: the extra-condensed cut is the title-block lettering,
// the regular cut carries long reading (READMEs, notes). Both cover Turkish.
const reading = Sofia_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-reading",
  display: "swap",
});
const caps = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caps-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Meta");

  return (
    <html lang={locale} className={`${reading.variable} ${caps.variable}`}>
      <body className="min-h-svh antialiased">
        <a
          href="#main"
          className="caps sr-only z-50 bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
