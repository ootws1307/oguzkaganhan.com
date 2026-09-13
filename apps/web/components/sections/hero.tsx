import { type Locale, pickLocale, type Section } from "@repo/content";
import { mediaUrl } from "@repo/db";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { type Fact, Facts } from "@/components/facts";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { cvPathFor } from "@/lib/sections";

type HeroProps = {
  section: Extract<Section, { key: "hero" }>;
  site: SiteData;
  locale: Locale;
};

/** The report opens by stating, in one breath, who wrote it and what he does. */
export async function HeroSection({ section, site, locale }: HeroProps) {
  const t = await getTranslations("Intro");
  const content = pickLocale(section.content, locale);
  const { settings } = site;
  const name = content?.title || settings.site_name;
  const cvPath = section.options.show_cv ? cvPathFor(site, locale) : null;
  const photo = section.options.show_photo ? settings.avatar_path : null;
  const status = section.options.show_status ? content?.status : null;

  const latest = (kind: "work" | "education") =>
    site.experiences.filter((e) => e.kind === kind).sort(byRecency)[0];
  const work = latest("work");
  const education = latest("education");
  const email = site.contactLinks.find((l) => l.kind === "email");
  const github = site.contactLinks.find((l) => l.kind === "github");

  const facts: Fact[] = [
    ...(work
      ? [
          {
            label: t("current"),
            value: (
              <>
                {pickLocale(work.role, locale) || work.organization}
                <span className="block text-ink-soft">{work.organization}</span>
              </>
            ),
          },
        ]
      : []),
    ...(education
      ? [
          {
            label: t("education"),
            value: (
              <>
                {pickLocale(education.role, locale) || education.organization}
                <span className="block text-ink-soft">
                  {education.organization}
                  {education.ended_on ? `, ${formatMonthYear(education.ended_on, locale)}` : ""}
                </span>
              </>
            ),
          },
        ]
      : []),
    // No GitHub row here: the action button and the contact section both lead there.
    ...(email
      ? [
          {
            label: t("contact"),
            value: (
              <a
                href={email.url.startsWith("mailto:") ? email.url : `mailto:${email.url}`}
                className="underline decoration-rule-strong transition-colors hover:decoration-signal"
              >
                {email.label}
              </a>
            ),
          },
        ]
      : []),
  ];

  const action = cvPath
    ? { href: mediaUrl(cvPath), label: t("downloadCv"), download: true, external: false }
    : email
      ? {
          href: email.url.startsWith("mailto:") ? email.url : `mailto:${email.url}`,
          label: t("writeEmail"),
          download: false,
          external: false,
        }
      : github
        ? {
            href: github.url,
            // The brand keeps its own language, or Turkish uppercase would print "GİTHUB".
            label: t.rich("seeCode", { brand: (chunks) => <span lang="en">{chunks}</span> }),
            download: false,
            external: true,
          }
        : null;

  return (
    <div className="page pt-10 pb-6 sm:pt-12 sm:pb-8">
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] leading-[1.02] font-semibold tracking-[-0.025em]">
            {name}
          </h1>
          {content?.subtitle && (
            <p className="mt-4 max-w-[38ch] text-xl leading-snug text-ink-soft sm:text-2xl">
              {content.subtitle}
            </p>
          )}
          {status && <p className="caps mt-5 text-xs text-signal">{status}</p>}
          {content?.body_md && (
            <div className="mt-8 max-w-[34rem]">
              <Markdown>{content.body_md}</Markdown>
            </div>
          )}
          {/* The one filled action sits with the name, so the two columns of the
              opening end near each other even when there is no intro to read. */}
          {action && (
            <a
              href={action.href}
              download={action.download}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
              className="caps mt-8 inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-xs text-paper transition-colors hover:bg-ink-hover"
            >
              {/* One flex item, or the button's gap would open inside the label. */}
              <span>{action.label}</span>
              {action.download ? <ArrowDown /> : <ArrowUpRight />}
            </a>
          )}
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          {photo && (
            <div className="mb-6 aspect-[4/5] w-40 lg:w-full">
              <Image
                src={mediaUrl(photo)}
                alt={settings.site_name}
                width={480}
                height={600}
                sizes="(min-width: 1024px) 28vw, 10rem"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}
          <Facts items={facts} />
        </div>
      </div>
    </div>
  );
}

function byRecency(a: { started_on: string }, b: { started_on: string }) {
  return b.started_on.localeCompare(a.started_on);
}
