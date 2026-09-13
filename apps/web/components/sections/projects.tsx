import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { ViewTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { SiteData } from "@/lib/data";
import { isRecent, projectNo, relativeTime } from "@/lib/format";
import { langFor } from "@/lib/lang";

/** The drawing register: one numbered row per project sheet. */
export async function ProjectsSheet({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "projects" }>;
  site: SiteData;
  locale: Locale;
}) {
  const t = await getTranslations("Projects");
  const { options } = section;
  const intro = pickLocale(section.content, locale)?.intro;

  let list = site.projects;
  if (options.featured_only) list = list.filter((p) => p.is_featured);
  if (options.max_items > 0) list = list.slice(0, options.max_items);

  return (
    <div>
      {intro && <p className="mb-10 max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
      {list.length === 0 ? (
        <p className="border-y border-ink py-6 text-ink-soft">{t("empty")}</p>
      ) : (
        <ol className="border-t border-ink">
          {list.map((project) => {
            const title = pickLocale(project.title, locale) || project.slug;
            const summary = pickLocale(project.summary, locale);
            const pushed = project.github?.pushed_at ?? null;
            return (
              <li key={project.id} className="border-b border-rule">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group -mx-3 grid gap-x-6 gap-y-2 px-3 py-5 transition-colors duration-150 hover:bg-paper-deep sm:grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[4.5rem_minmax(0,1fr)_15rem_10rem]"
                >
                  <span className="caps tnum pt-1 text-sm text-ink-soft">
                    {projectNo(site.projects.indexOf(project) + 1)}
                  </span>
                  <div className="min-w-0">
                    <ViewTransition
                      name={`title-${project.slug}`}
                      share="sheet-title"
                      default="none"
                    >
                      <h3
                        lang={langFor(project.text_origin.title[locale], title)}
                        className={`caps leading-none decoration-1 underline-offset-4 group-hover:underline group-hover:decoration-double ${project.is_featured ? "text-3xl" : "text-2xl"}`}
                      >
                        {title}
                      </h3>
                    </ViewTransition>
                    {summary && (
                      <p className="mt-2 line-clamp-2 max-w-[65ch] text-ink-soft">{summary}</p>
                    )}
                  </div>
                  <ul
                    lang="en"
                    className="flex flex-wrap content-start gap-1.5 pt-1 sm:col-start-2 lg:col-start-auto"
                  >
                    {project.tech.slice(0, 4).map((tech) => (
                      <li
                        key={tech}
                        className="caps border border-ink-soft px-1.5 py-0.5 text-[0.72rem] leading-none"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <div className="caps tnum flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm text-ink-soft sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-end lg:text-right">
                    {pushed && (
                      <span className={isRecent(pushed) ? "text-redline" : undefined}>
                        {relativeTime(pushed, locale)}
                      </span>
                    )}
                    {options.show_github_stats && !!project.github?.stars && (
                      <span>{t("stars", { count: project.github.stars })}</span>
                    )}
                    {project.github?.is_archived && <span>{t("archived")}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
