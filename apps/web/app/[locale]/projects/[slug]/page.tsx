import { isLocale, pickLocale } from "@repo/content";
import { mediaUrl } from "@repo/db";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ViewTransition } from "react";
import { Frame } from "@/components/frame";
import { ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { TitleBlock, TitleBlockAction, type TitleBlockRow } from "@/components/title-block";
import { loadProject, loadSite } from "@/lib/data";
import { formatDate, formatMonthYear, isRecent, projectNo, relativeTime } from "@/lib/format";
import { langFor } from "@/lib/lang";

const DETAIL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

  const [site, data, t, tp] = await Promise.all([
    loadSite(),
    loadProject(slug),
    getTranslations("Sheet"),
    getTranslations("Projects"),
  ]);
  if (!data) notFound();

  const { project, images } = data;
  const number = projectNo(site.projects.findIndex((p) => p.id === project.id) + 1);
  const title = pickLocale(project.title, locale) || project.slug;
  const summary = pickLocale(project.summary, locale);
  const notes = pickLocale(project.body_md, locale)?.trim();
  const pushed = project.github?.pushed_at ?? null;

  const rows: TitleBlockRow[] = [
    { label: tp("sheetTitle"), value: title },
    { label: tp("sourceLabel"), value: project.github?.full_name ?? tp("custom") },
    ...(project.tech.length > 0 ? [{ label: tp("stack"), value: project.tech.join(" · ") }] : []),
    ...(project.started_on
      ? [
          {
            label: tp("period"),
            value: `${formatMonthYear(project.started_on, locale)} – ${
              project.ended_on ? formatMonthYear(project.ended_on, locale) : tp("ongoing")
            }`,
          },
        ]
      : []),
    ...(pushed
      ? [
          {
            label: t("revision"),
            value: `${formatDate(pushed, locale)} (${relativeTime(pushed, locale)})`,
            redline: isRecent(pushed),
          },
        ]
      : []),
    // Zero stars is left unsaid rather than printed.
    ...(project.github?.stars
      ? [{ label: tp("starsLabel"), value: tp("stars", { count: project.github.stars }) }]
      : []),
    { label: t("sheet"), value: number },
  ];

  const links = [
    project.repo_url && { href: project.repo_url, label: tp("source") },
    project.live_url && { href: project.live_url, label: tp("live") },
  ].filter((l): l is { href: string; label: string } => !!l);

  return (
    <>
      <SiteNav
        siteName={site.settings.site_name}
        back={{ href: "/#projects", label: tp("back") }}
      />
      <ViewTransition default="sheet-page">
        <main id="main">
          <article className="mx-auto w-full max-w-[1480px] px-3 pt-3 sm:px-6 sm:pt-6">
            <div className="relative border border-rule">
              <div className="relative text-ink">
                <Frame />
                <div className="flex items-baseline justify-between gap-4 border-b border-ink px-4 py-2.5 sm:px-6">
                  <p className="caps text-lg leading-none sm:text-xl">{tp("sheetTitle")}</p>
                  <p className="caps tnum shrink-0 text-sm leading-none text-ink-soft">
                    {t("sheet")} <span className="text-ink">{number}</span>
                  </p>
                </div>

                <div className="grid gap-12 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-12">
                  <div className="min-w-0 lg:col-span-8">
                    <ViewTransition
                      name={`title-${project.slug}`}
                      share="sheet-title"
                      default="none"
                    >
                      <h1
                        lang={langFor(project.text_origin.title[locale], title)}
                        className="caps text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.92] font-bold"
                      >
                        {title}
                      </h1>
                    </ViewTransition>
                    {summary && (
                      <p className="mt-5 max-w-[55ch] text-xl leading-snug text-ink-soft">
                        {summary}
                      </p>
                    )}

                    {images.length > 0 && (
                      <section aria-labelledby="details-title" className="mt-14">
                        <h2
                          id="details-title"
                          className="caps border-b border-ink pb-2 text-sm text-ink-soft"
                        >
                          {tp("details")}
                        </h2>
                        <div className="mt-6 grid gap-8 sm:grid-cols-2">
                          {images.map((image, i) => {
                            const alt = pickLocale(image.alt, locale) ?? "";
                            const wide = i === 0 && images.length % 2 === 1;
                            return (
                              <figure key={image.id} className={wide ? "sm:col-span-2" : undefined}>
                                <div
                                  className="relative border border-ink bg-paper-deep"
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
                                    sizes={
                                      wide
                                        ? "(min-width: 1024px) 60vw, 95vw"
                                        : "(min-width: 1024px) 30vw, 95vw"
                                    }
                                    className="object-contain"
                                  />
                                </div>
                                <figcaption className="mt-2 flex gap-3 text-sm text-ink-soft">
                                  <span className="caps shrink-0 text-ink">
                                    {t("detail")} {DETAIL_LETTERS[i % DETAIL_LETTERS.length]}
                                  </span>
                                  {alt}
                                </figcaption>
                              </figure>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    <section aria-labelledby="notes-title" className="mt-14">
                      <h2
                        id="notes-title"
                        className="caps border-b border-ink pb-2 text-sm text-ink-soft"
                      >
                        {tp("notes")}
                      </h2>
                      <div className="mt-6 max-w-[72ch]">
                        {notes ? (
                          <Markdown
                            repo={project.github?.full_name}
                            lang={langFor(project.text_origin.body_md[locale], notes)}
                          >
                            {notes}
                          </Markdown>
                        ) : (
                          <p className="text-ink-soft">{tp("noNotes")}</p>
                        )}
                      </div>
                    </section>
                  </div>

                  <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
                      <TitleBlock
                        mark={
                          <span className="caps tnum text-xl leading-none sm:text-2xl">
                            {number}
                          </span>
                        }
                        rows={rows}
                        action={
                          links.length > 0 ? (
                            <div className="grid divide-y divide-paper/30">
                              {links.map((link) => (
                                <TitleBlockAction key={link.href} href={link.href} external>
                                  {link.label}
                                  <ArrowUpRight />
                                </TitleBlockAction>
                              ))}
                            </div>
                          ) : undefined
                        }
                      />
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </article>
        </main>
      </ViewTransition>
      <SiteFooter siteName={site.settings.site_name} />
    </>
  );
}
