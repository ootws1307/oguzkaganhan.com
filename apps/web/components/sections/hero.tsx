import { type Locale, pickLocale, type Section } from "@repo/content";
import { mediaUrl, type ProjectView } from "@repo/db";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Dimension } from "@/components/dimension";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { TitleBlock, TitleBlockAction, type TitleBlockRow } from "@/components/title-block";
import { Link } from "@/i18n/navigation";
import type { SiteData } from "@/lib/data";
import { formatDate, isRecent, monogram, projectNo, relativeTime } from "@/lib/format";
import { langFor } from "@/lib/lang";
import { cvPathFor } from "@/lib/sheets";

type HeroProps = {
  section: Extract<Section, { key: "hero" }>;
  site: SiteData;
  locale: Locale;
  sheetNumber: string;
};

export async function HeroSheet({ section, site, locale, sheetNumber }: HeroProps) {
  const t = await getTranslations("Sheet");
  const content = pickLocale(section.content, locale);
  const { settings } = site;
  const name = content?.title || settings.site_name;
  const featured = site.projects.find((p) => p.is_featured) ?? site.projects[0] ?? null;
  const cvPath = section.options.show_cv ? cvPathFor(site, locale) : null;
  const fallbackLink = site.contactLinks.find((l) => l.kind !== "email");
  const photo = section.options.show_photo && settings.avatar_path;

  const rows: TitleBlockRow[] = [
    { label: t("drawnBy"), value: settings.site_name },
    ...(content?.subtitle ? [{ label: t("role"), value: content.subtitle }] : []),
    ...(section.options.show_status && content?.status
      ? [{ label: t("status"), value: content.status, redline: true }]
      : []),
    {
      label: t("revision"),
      value: settings.last_github_sync_at
        ? formatDate(settings.last_github_sync_at, locale)
        : t("neverSynced"),
    },
    { label: t("sheet"), value: sheetNumber },
  ];

  return (
    // The cover fills the first viewport only when it has an intro to hold; a sparse
    // cover sizes to its content instead of stretching into empty paper.
    <div
      className={`grid gap-12 lg:grid-cols-12 lg:gap-10 ${content?.body_md ? "lg:min-h-[calc(100svh-var(--nav-h)-10rem)]" : ""}`}
    >
      <div className="flex flex-col justify-between gap-10 lg:col-span-7">
        <div>
          <h1
            id="hero-title"
            className="caps text-[clamp(3.25rem,9.5vw,6rem)] leading-[0.88] font-bold tracking-[-0.005em]"
          >
            {name}
          </h1>
          {content?.subtitle && (
            <p className="mt-6 max-w-[34ch] text-xl leading-snug text-ink-soft sm:text-2xl">
              {content.subtitle}
            </p>
          )}
        </div>
        {content?.body_md && (
          <div className="max-w-[60ch] text-lg">
            <Markdown>{content.body_md}</Markdown>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-10 lg:col-span-5">
        {featured ? (
          <FeaturedView
            project={featured}
            number={site.projects.indexOf(featured) + 1}
            locale={locale}
          />
        ) : (
          <div />
        )}
        <TitleBlock
          mark={
            photo ? (
              <div className="relative aspect-square w-full bg-photo-ground">
                <Image
                  src={mediaUrl(settings.avatar_path as string)}
                  alt={settings.site_name}
                  fill
                  sizes="96px"
                  className="object-cover mix-blend-multiply grayscale"
                />
              </div>
            ) : (
              <span className="caps text-3xl leading-none sm:text-4xl">
                {monogram(settings.site_name)}
              </span>
            )
          }
          rows={rows}
          action={
            cvPath ? (
              <TitleBlockAction href={mediaUrl(cvPath)} download>
                {t("downloadCv")}
                <ArrowDown />
              </TitleBlockAction>
            ) : fallbackLink ? (
              <TitleBlockAction href={fallbackLink.url} external>
                {fallbackLink.label}
                <ArrowUpRight />
              </TitleBlockAction>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}

/** The featured project drawn as a section view, dimensioned with its own data. */
async function FeaturedView({
  project,
  number,
  locale,
}: {
  project: ProjectView;
  number: number;
  locale: Locale;
}) {
  const t = await getTranslations("Projects");
  const title = pickLocale(project.title, locale) || project.slug;
  const summary = pickLocale(project.summary, locale);
  const pushed = project.github?.pushed_at ?? null;

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2">
        <div lang={project.github ? "en" : undefined}>
          <Dimension label={project.github?.full_name ?? t("custom")} />
        </div>
        <span />
        <div className="relative flex min-h-60 flex-col justify-between gap-6 border border-ink p-5 transition-colors duration-200 group-hover:bg-paper-deep">
          {project.cover_path ? (
            <div className="relative -m-5 mb-0 aspect-[16/10] border-b border-ink bg-paper-deep">
              <Image
                src={mediaUrl(project.cover_path)}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          ) : (
            summary && <p className="max-w-[46ch] text-ink-soft">{summary}</p>
          )}
          <div>
            {/* No shared-element name here: the register row owns this project's title morph. */}
            <p
              lang={langFor(project.text_origin.title[locale], title)}
              className="caps text-3xl leading-none group-hover:underline decoration-double decoration-1 underline-offset-4"
            >
              {title}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <span className="caps tnum text-sm text-ink-soft">
                {projectNo(number)} · {t("featured")}
              </span>
              {project.tech.length > 0 && (
                <ul lang="en" className="flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 4).map((tech) => (
                    <li
                      key={tech}
                      className="caps border border-ink-soft px-1.5 py-0.5 text-[0.72rem] leading-none"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {pushed ? (
          <Dimension
            orientation="vertical"
            label={`${t("pushed")} ${relativeTime(pushed, locale)}`}
            className={isRecent(pushed) ? "[&>span:nth-child(3)]:text-redline" : ""}
          />
        ) : (
          <span />
        )}
      </div>
    </Link>
  );
}
