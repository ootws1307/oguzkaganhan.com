import { type Locale, pickLocale, type Section } from "@repo/content";
import type { SiteData } from "@/lib/data";

/** One ruled row per group: the group names the field, the entries are the value. */
export function SkillsSection({
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
      {intro && <p className="mb-8 max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
      <dl className="border-t border-ink">
        {groups.map((group) => (
          <div
            key={group.id}
            className="grid gap-x-8 gap-y-1 border-b border-rule py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <dt className="caps pt-1 text-[0.6875rem] text-ink-faint">
              {pickLocale(group.name, locale)}
            </dt>
            <dd className="text-[0.9375rem] leading-relaxed">
              {group.skills.map((skill) => skill.name).join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
