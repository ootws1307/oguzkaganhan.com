import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";

/** Laid out like a drawing's revision table: period | what changed | where, ruled. */
export async function ExperienceSheet({
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
  // A single group would only repeat the sheet's own title.
  const labelled = groups.length > 1;

  return (
    <div className="space-y-12">
      {intro && <p className="max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
      {groups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={labelled ? `experience-${group.key}` : undefined}
          aria-label={labelled ? undefined : group.label}
        >
          {labelled && (
            <h3 id={`experience-${group.key}`} className="caps mb-3 text-sm text-ink-soft">
              {group.label}
            </h3>
          )}
          <ol className="border-y border-ink">
            {group.items.map((item) => {
              const role = pickLocale(item.role, locale);
              const description = pickLocale(item.description_md, locale);
              return (
                <li
                  key={item.id}
                  className="grid border-b border-rule last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,1fr)_12rem]"
                >
                  <p className="caps tnum pt-5 pb-1 text-sm text-ink-soft sm:py-5 sm:pr-5">
                    {formatMonthYear(item.started_on, locale)} –{" "}
                    {item.ended_on ? formatMonthYear(item.ended_on, locale) : t("present")}
                  </p>
                  <div className="min-w-0 pb-5 sm:border-l sm:border-rule sm:py-5 sm:pl-6 lg:pr-6">
                    {role && <h4 className="text-xl leading-snug font-semibold">{role}</h4>}
                    <p className="text-ink-soft">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-ink-faint hover:decoration-ink"
                        >
                          {item.organization}
                        </a>
                      ) : (
                        item.organization
                      )}
                      {item.location && <span className="lg:hidden"> · {item.location}</span>}
                    </p>
                    {description && (
                      <div className="mt-3 max-w-[65ch]">
                        <Markdown>{description}</Markdown>
                      </div>
                    )}
                  </div>
                  <p className="caps hidden border-l border-rule py-5 pl-5 text-sm text-ink-soft lg:block">
                    {item.location}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
