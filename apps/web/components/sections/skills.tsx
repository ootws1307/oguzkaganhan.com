import { type Locale, pickLocale, type Section } from "@repo/content";
import type { SiteData } from "@/lib/data";

/** A drawing legend: each group is a schedule column of symbols and names. */
export function SkillsSheet({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "skills" }>;
  site: SiteData;
  locale: Locale;
}) {
  const intro = pickLocale(section.content, locale)?.intro;
  const groups = site.skillGroups.filter((g) => g.skills.length > 0);

  return (
    <div>
      {intro && <p className="mb-10 max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
      {/* Groups share the sheet; a lone group spreads its entries over columns instead of leaving three empty. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-x-8 gap-y-10">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`skills-${group.id}`}>
            <h3
              id={`skills-${group.id}`}
              className="caps border-b border-ink pb-2 text-sm text-ink-soft"
            >
              {pickLocale(group.name, locale)}
            </h3>
            <ul
              className={`mt-4 gap-x-8 [&>li]:mb-2 [&>li]:break-inside-avoid ${groups.length === 1 ? "columns-[12rem]" : ""}`}
            >
              {group.skills.map((skill) => (
                <li key={skill.id} className="flex items-center gap-3 text-lg">
                  <span aria-hidden className="size-2 shrink-0 border border-ink" />
                  {skill.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
