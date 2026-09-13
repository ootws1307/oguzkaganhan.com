import { isLocale, pickLocale } from "@repo/content";
import { mediaUrl } from "@repo/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ViewTransition } from "react";
import { AboutSheet } from "@/components/sections/about";
import { ContactSheet } from "@/components/sections/contact";
import { ExperienceSheet } from "@/components/sections/experience";
import { HeroSheet } from "@/components/sections/hero";
import { ProjectsSheet } from "@/components/sections/projects";
import { SkillsSheet } from "@/components/sections/skills";
import { Sheet } from "@/components/sheet";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { loadSite } from "@/lib/data";
import { sheetNo } from "@/lib/format";
import { buildSheets, type SheetEntry } from "@/lib/sheets";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { settings } = await loadSite();
  const title =
    pickLocale(settings.seo_title as { tr: string; en: string }, locale) || settings.site_name;
  const description = pickLocale(settings.seo_description as { tr: string; en: string }, locale);
  return {
    title,
    description: description || undefined,
    alternates: { canonical: `/${locale}`, languages: { tr: "/tr", en: "/en" } },
    openGraph: {
      title,
      description: description || undefined,
      locale,
      type: "profile",
      images: settings.og_image_path ? [mediaUrl(settings.og_image_path)] : undefined,
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [site, t] = await Promise.all([loadSite(), getTranslations("Sheet")]);
  const sheets = buildSheets(site, locale, t("cover"));
  const total = sheets.length;
  const navItems = sheets.map((s, i) => ({
    id: s.id,
    title: s.title,
    no: String(i + 1).padStart(2, "0"),
  }));

  const body = (entry: SheetEntry, sheetNumber: string) => {
    const { section } = entry;
    switch (section.key) {
      case "hero":
        return (
          <HeroSheet section={section} site={site} locale={locale} sheetNumber={sheetNumber} />
        );
      case "about":
        return <AboutSheet section={section} site={site} locale={locale} />;
      case "projects":
        return <ProjectsSheet section={section} site={site} locale={locale} />;
      case "experience":
        return <ExperienceSheet section={section} site={site} locale={locale} />;
      case "skills":
        return <SkillsSheet section={section} site={site} locale={locale} />;
      case "contact":
        return <ContactSheet section={section} site={site} locale={locale} />;
    }
  };

  const hero = sheets.find((s) => s.section.key === "hero")?.section;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.settings.site_name,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}`,
    jobTitle:
      hero?.key === "hero" ? pickLocale(hero.content, locale)?.subtitle || undefined : undefined,
    sameAs: site.contactLinks.filter((l) => l.kind !== "email").map((l) => l.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from our own data, with "<" escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
      <SiteNav siteName={site.settings.site_name} items={navItems} />
      <ViewTransition default="sheet-page">
        <main id="main" className="space-y-3 sm:space-y-6">
          {sheets.map((entry, i) => {
            const sheetNumber = sheetNo(i + 1, total);
            return (
              <Sheet
                key={entry.id}
                id={entry.id}
                title={entry.title}
                sheetLabel={t("sheet")}
                sheetNumber={sheetNumber}
                lead={i === 0}
                titleAs={entry.section.key === "hero" ? "p" : "h2"}
              >
                {body(entry, sheetNumber)}
              </Sheet>
            );
          })}
        </main>
      </ViewTransition>
      <SiteFooter siteName={site.settings.site_name} />
    </>
  );
}
