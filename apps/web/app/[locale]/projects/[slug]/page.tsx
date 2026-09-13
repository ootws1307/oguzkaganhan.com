import { isLocale, pickLocale } from "@repo/content";
import { mediaUrl } from "@repo/db";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ViewTransition } from "react";
import { type Fact, Facts } from "@/components/facts";
import { ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadProject, loadSite } from "@/lib/data";
import { formatDate, formatMonthYear, isRecent } from "@/lib/format";
import { langFor } from "@/lib/lang";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [site, data] = await Promise.all([loadSite(), loadProject(slug)]);
  if (!data) return {};
  const title = pickLocale(data.project.title, locale) || slug;
  const description = pickLocale(data.project.summary, locale) || undefined;
  return {
    title: `${title} — ${site.settings.site_name}`,
    description,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { tr: `/tr/projects/${slug}`, en: `/en/projects/${slug}` },
    },
    openGraph: {
      title,
      description,
      images: data.project.cover_path ? [mediaUrl(data.project.cover_path)] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [site, data, t] = await Promise.all([
    loadSite(),
    loadProject(slug),
    getTranslations("Projects"),
  ]);
  if (!data) notFound();

  const { project, images } = data;
  const title = pickLocale(project.title, locale) || project.slug;
  const summary = pickLocale(project.summary, locale);
  const notes = pickLocale(project.body_md, locale)?.trim();
  const notesFromRepo = project.text_origin.body_md[locale] === "repo";
  const pushed = project.github?.pushed_at ?? null;

  const facts: Fact[] = [
    {
      label: t("column.source"),
      value: project.github ? <span lang="en">{project.github.full_name}</span> : t("custom"),
    },
    ...(project.tech.length > 0
      ? [{ label: t("column.stack"), value: <span lang="en">{project.tech.join(", ")}</span> }]
      : []),
    ...(project.started_on
      ? [
          {
            label: t("period"),
            value: `${formatMonthYear(project.started_on, locale)} – ${
              project.ended_on ? formatMonthYear(project.ended_on, locale) : t("ongoing")
            }`,
          },
        ]
      : []),
    ...(pushed
      ? [
          {
            label: t("column.updated"),
            value: formatDate(pushed, locale),
            current: isRecent(pushed),
          },
        ]
      : []),
    // Zero stars is left unsaid rather than printed.
    ...(project.github?.stars
      ? [{ label: t("starsLabel"), value: t("stars", { count: project.github.stars }) }]
      : []),
  ];

  const links = [
    project.repo_url && { href: project.repo_url, label: t("source") },
    project.live_url && { href: project.live_url, label: t("live") },
  ].filter((l): l is { href: string; label: string } => !!l);

  return (
    <>
      <SiteHeader
        siteName={site.settings.site_name}
        back={{ href: "/#projects", label: t("back") }}
        navLabel={t("back")}
      />
      <ViewTransition default="page-body">
        <main id="main">
          <article className="page pt-10 pb-4 sm:pt-14">
            <ViewTransition name={`project-${project.slug}`} share="project-title" default="none">
              <h1
                lang={langFor(project.text_origin.title[locale], title)}
                className="max-w-[20ch] text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.025em]"
              >
                {title}
              </h1>
            </ViewTransition>
            {summary && (
              <p className="mt-4 max-w-[58ch] text-xl leading-snug text-ink-soft">{summary}</p>
            )}

            <div className="mt-12 grid gap-x-10 gap-y-12 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                {images.length > 0 && (
                  <section aria-label={t("images")} className="mb-12 space-y-8">
                    {images.map((image) => {
                      const alt = pickLocale(image.alt, locale) ?? "";
                      return (
                        <figure key={image.id}>
                          <div
                            className="relative border border-rule bg-paper-deep"
                            style={{
                              aspectRatio:
                                image.width && image.height
                                  ? `${image.width} / ${image.height}`
                                  : "16 / 10",
                            }}
                          >
                            <Image
                              src={mediaUrl(image.path)}
                              alt={alt}
                              fill
                              sizes="(min-width: 1024px) 60vw, 95vw"
                              className="object-contain"
                            />
                          </div>
                          {alt && (
                            <figcaption className="mt-2 text-[0.9375rem] text-ink-faint">
                              {alt}
                            </figcaption>
                          )}
                        </figure>
                      );
                    })}
                  </section>
                )}

                <section aria-labelledby="notes-title">
                  <h2
                    id="notes-title"
                    className="caps border-b border-ink pb-2 text-[0.6875rem] text-ink-faint"
                  >
                    {notesFromRepo ? t("readme") : t("notes")}
                  </h2>
                  <div className="mt-6 max-w-[34rem]">
                    {notes ? (
                      <Markdown
                        repo={project.github?.full_name}
                        lang={langFor(project.text_origin.body_md[locale], notes)}
                      >
                        {notes}
                      </Markdown>
                    ) : (
                      <p className="text-ink-soft">{t("noNotes")}</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
                  <Facts items={facts} />
                  {links.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {links.map((link, i) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={`caps inline-flex items-center gap-2 px-4 py-2.5 text-xs transition-colors ${
                            i === 0
                              ? "bg-ink text-paper hover:bg-ink-hover"
                              : "border border-rule-strong text-ink hover:border-ink"
                          }`}
                        >
                          {link.label}
                          <ArrowUpRight />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </article>
        </main>
      </ViewTransition>
      <SiteFooter siteName={site.settings.site_name} />
    </>
  );
}
