import { type Locale, type Localized, pickLocale, type Section } from "@repo/content";
import type { SiteData } from "./data";

export type SectionEntry = { section: Section; id: string; title: string };

function hasBody(content: Localized<{ body_md: string }>, locale: Locale): boolean {
  return !!pickLocale(content, locale)?.body_md.trim();
}

/** A section is printed only when it has something to report. */
function hasContent(section: Section, site: SiteData, locale: Locale): boolean {
  switch (section.key) {
    case "hero":
    case "projects":
      return true;
    case "about":
      return (
        hasBody(section.content, locale) ||
        (section.options.show_photo && !!site.settings.avatar_path)
      );
    case "experience": {
      const { show_education } = section.options;
      return site.experiences.some((e) => e.kind === "work" || show_education);
    }
    case "skills":
      return site.skillGroups.some((g) => g.skills.length > 0);
    case "contact":
      return site.contactLinks.length > 0 || hasBody(section.content, locale);
  }
}

export function buildSections(site: SiteData, locale: Locale, introTitle: string): SectionEntry[] {
  return site.sections
    .filter((section) => section.is_visible && hasContent(section, site, locale))
    .map((section) => ({
      section,
      id: section.key,
      title:
        section.key === "hero"
          ? introTitle
          : (pickLocale(section.content as Localized<{ title: string }>, locale)?.title ?? ""),
    }));
}

export function cvPathFor(site: SiteData, locale: Locale): string | null {
  const paths = site.settings.cv_paths as { tr: string | null; en: string | null } | null;
  return pickLocale(paths ?? undefined, locale) ?? null;
}
