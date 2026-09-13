import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";

/** Periods on the left, what happened in them on the right. */
export async function ExperienceSection({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "experience" }>;
  site: SiteData;
  locale: Locale;
}) {
  const t = await getTranslations("Experience");
  const intro = pickLocale(section.content, locale)?.intro;
  const groups = [
    { key: "work", label: t("work"), items: site.experiences.filter((e) => e.kind === "work") },
    {
      key: "education",
      label: t("education"),
      items: section.options.show_education
        ? site.experiences.filter((e) => e.kind === "education")
        : [],
    },
  ].filter((g) => g.items.length > 0);
  // With one group only, its label would just repeat the section's own name.
  const labelled = groups.length > 1;

  return (
    <div className="space-y-10">
      {intro && <p className="max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
      {groups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={labelled ? `experience-${group.key}` : undefined}
          aria-label={labelled ? undefined : group.label}
        >
          {labelled && (
            <h3
              id={`experience-${group.key}`}
              className="caps border-b border-ink pb-2 text-[0.6875rem] text-ink-faint"
            >
              {group.label}
            </h3>
          )}
          <ul className={labelled ? "" : "border-t border-ink"}>
            {group.items.map((item) => {
              const role = pickLocale(item.role, locale);
              const description = pickLocale(item.description_md, locale);
              return (
                <li
                  key={item.id}
                  className="grid gap-x-8 gap-y-1 border-b border-rule py-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
                >
                  <p className="pt-0.5 text-[0.9375rem] text-ink-faint">
                    {formatMonthYear(item.started_on, locale)} –{" "}
                    {item.ended_on ? formatMonthYear(item.ended_on, locale) : t("present")}
                  </p>
                  <div className="min-w-0">
                    {role && <h4 className="text-lg leading-snug font-medium">{role}</h4>}
                    <p className="text-[0.9375rem] text-ink-soft">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-rule-strong transition-colors hover:decoration-signal"
                        >
                          {item.organization}
                        </a>
                      ) : (
                        item.organization
                      )}
                      {item.location && <span className="text-ink-faint"> · {item.location}</span>}
                    </p>
                    {description && (
                      <div className="mt-3 max-w-[32rem] text-[0.9375rem]">
                        <Markdown>{description}</Markdown>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
