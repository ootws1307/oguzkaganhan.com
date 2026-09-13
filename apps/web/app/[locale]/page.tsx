import { isLocale, pickLocale } from "@repo/content";
import { mediaUrl } from "@repo/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ViewTransition } from "react";
import { Band } from "@/components/band";
import { AboutSection } from "@/components/sections/about";
import { ContactSection } from "@/components/sections/contact";
import { ExperienceSection } from "@/components/sections/experience";
import { HeroSection } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadSite } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { buildSections, type SectionEntry } from "@/lib/sections";

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

  const [site, t] = await Promise.all([loadSite(), getTranslations("Meta")]);
  const sections = buildSections(site, locale, site.settings.site_name);
  // The intro is the page's own head; the index lists what follows it.
  const navItems = sections
    .filter((entry) => entry.section.key !== "hero")
    .map((entry) => ({ id: entry.id, title: entry.title }));

  const body = (entry: SectionEntry) => {
    const { section } = entry;
    switch (section.key) {
      case "hero":
        return <HeroSection section={section} site={site} locale={locale} />;
      case "about":
        return <AboutSection section={section} site={site} locale={locale} />;
      case "projects":
        return <ProjectsSection section={section} site={site} locale={locale} />;
      case "experience":
        return <ExperienceSection section={section} site={site} locale={locale} />;
      case "skills":
        return <SkillsSection section={section} site={site} locale={locale} />;
      case "contact":
        return <ContactSection section={section} site={site} locale={locale} />;
    }
  };

  const hero = sections.find((s) => s.section.key === "hero")?.section;
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
      <SiteHeader siteName={site.settings.site_name} items={navItems} navLabel={t("sections")} />
      <ViewTransition default="page-body">
        <main id="main" className="space-y-14 sm:space-y-20">
          {sections.map((entry) =>
            entry.section.key === "hero" ? (
              <div key={entry.id}>{body(entry)}</div>
            ) : (
              <Band key={entry.id} id={entry.id} title={entry.title}>
                {body(entry)}
              </Band>
            ),
          )}
        </main>
      </ViewTransition>
      <SiteFooter
        siteName={site.settings.site_name}
        updated={
          site.settings.last_github_sync_at
            ? t("updated", { date: formatDate(site.settings.last_github_sync_at, locale) })
            : undefined
        }
      />
    </>
  );
}
