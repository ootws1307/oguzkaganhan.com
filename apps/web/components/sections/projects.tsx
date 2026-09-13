import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { ViewTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { SiteData } from "@/lib/data";
import { formatDate, isRecent } from "@/lib/format";
import { langFor } from "@/lib/lang";

const ROW = "grid gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_10rem_7rem]";

/** The index of the work: one ruled row per project, with its own date. */
export async function ProjectsSection({
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

  if (list.length === 0) {
    return (
      <div>
        {intro && <p className="mb-8 max-w-[62ch] text-lg text-ink-soft">{intro}</p>}
        <p className="border-y border-rule py-5 text-ink-soft">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div>
      {intro && <p className="mb-8 max-w-[62ch] text-lg text-ink-soft">{intro}</p>}

      {/* Column heads label the table; the rows below carry the semantics. */}
      <div
        aria-hidden
        className={`${ROW} caps hidden border-b border-ink pb-2 text-[0.6875rem] text-ink-faint sm:grid`}
      >
        <span>{t("column.project")}</span>
        <span>{t("column.stack")}</span>
        <span className="text-right">{t("column.updated")}</span>
      </div>

      <ul className="border-t border-ink sm:border-t-0">
        {list.map((project) => {
          const title = pickLocale(project.title, locale) || project.slug;
          const summary = pickLocale(project.summary, locale);
          const pushed = project.github?.pushed_at ?? null;
          const current = isRecent(pushed);
          return (
            <li key={project.id}>
              {/* The row's own rule darkens on hover and focus: a report underlines
                  the line you are reading, it does not fill it in. */}
              <Link
                href={`/projects/${project.slug}`}
                className={`${ROW} group border-b border-rule py-4 transition-colors duration-150 hover:border-ink focus-visible:border-ink`}
              >
                <span className="min-w-0">
                  <ViewTransition
                    name={`project-${project.slug}`}
                    share="project-title"
                    default="none"
                  >
                    <span
                      lang={langFor(project.text_origin.title[locale], title)}
                      className="text-lg leading-snug font-medium decoration-signal decoration-1 underline-offset-[0.2em] group-hover:underline group-focus-visible:underline"
                    >
                      {title}
                    </span>
                  </ViewTransition>
                  {project.is_featured && (
                    <span className="caps ml-2.5 align-[0.15em] text-[0.6875rem] text-signal">
                      {t("featured")}
                    </span>
                  )}
                  {summary && (
                    <span className="mt-1 line-clamp-2 max-w-[62ch] text-[0.9375rem] text-ink-soft">
                      {summary}
                    </span>
                  )}
                </span>

                {/* Below the column heads' breakpoint each cell names its own field. */}
                <span className="text-[0.9375rem] text-ink-soft">
                  <span className="caps mr-2 text-[0.6875rem] text-ink-faint sm:hidden">
                    {t("column.stack")}
                  </span>
                  <span lang="en">{project.tech.slice(0, 3).join(", ")}</span>
                </span>

                <span className="text-[0.9375rem] text-ink-soft sm:text-right">
                  <span className="caps mr-2 text-[0.6875rem] text-ink-faint sm:hidden">
                    {t("column.updated")}
                  </span>
                  <span
                    className={`transition-colors duration-150 group-hover:text-signal group-focus-visible:text-signal ${
                      current ? "text-signal" : ""
                    }`}
                  >
                    {/* The column stays whole: a project with no push still prints a mark. */}
                    {pushed ? formatDate(pushed, locale) : "—"}
                  </span>
                  {options.show_github_stats && !!project.github?.stars && (
                    <span className="block text-ink-faint">
                      {t("stars", { count: project.github.stars })}
                    </span>
                  )}
                  {project.github?.is_archived && (
                    <span className="caps block text-[0.6875rem] text-ink-faint">
                      {t("archived")}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
