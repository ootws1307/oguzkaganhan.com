import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";

function hrefFor(kind: string, url: string) {
  if (kind === "email" && !url.startsWith("mailto:")) return `mailto:${url}`;
  return url;
}

const BRAND_KINDS = new Set(["github", "linkedin", "x"]);

/** The address as a reader would write it down: no protocol, no trailing slash. */
function readable(url: string) {
  return url
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

export async function ContactSection({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "contact" }>;
  site: SiteData;
  locale: Locale;
}) {
  const t = await getTranslations("Contact");
  const body = pickLocale(section.content, locale)?.body_md.trim();
  const links = site.contactLinks.filter((l) => section.options.show_email || l.kind !== "email");

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
      {body && (
        <div className="max-w-[58ch] lg:col-span-5">
          <Markdown>{body}</Markdown>
        </div>
      )}
      <ul className={`border-t border-ink ${body ? "lg:col-span-7" : "lg:col-span-12"}`}>
        {links.map((link) => {
          const external = link.kind !== "email";
          return (
            <li key={link.id}>
              <a
                href={hrefFor(link.kind, link.url)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group grid grid-cols-[6rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-rule py-3 transition-colors duration-150 hover:border-ink focus-visible:border-ink"
              >
                {/* Brand names stay English so Turkish uppercase keeps their "i". */}
                <span
                  lang={BRAND_KINDS.has(link.kind) ? "en" : undefined}
                  className="caps text-[0.6875rem] text-ink-faint"
                >
                  {t(`kinds.${link.kind}`)}
                </span>
                <span className="min-w-0">
                  <span className="break-words decoration-signal decoration-1 underline-offset-[0.2em] group-hover:underline group-focus-visible:underline">
                    {link.label}
                  </span>
                  {readable(link.url) !== link.label && (
                    <span lang="en" className="block text-[0.9375rem] break-words text-ink-faint">
                      {readable(link.url)}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="self-center text-ink-faint transition-colors group-hover:text-signal" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
