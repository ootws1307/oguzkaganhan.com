import { type Locale, pickLocale, type Section } from "@repo/content";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";

function hrefFor(kind: string, url: string) {
  if (kind === "email" && !url.startsWith("mailto:")) return `mailto:${url}`;
  return url;
}

export async function ContactSheet({
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
    <div className="grid gap-10 lg:grid-cols-12">
      {body && (
        <div className="max-w-[60ch] text-lg lg:col-span-5">
          <Markdown>{body}</Markdown>
        </div>
      )}
      <ul className={`border-t border-ink ${body ? "lg:col-span-7" : "lg:col-span-12"}`}>
        {links.map((link) => {
          const external = link.kind !== "email";
          return (
            <li key={link.id} className="border-b border-rule">
              <a
                href={hrefFor(link.kind, link.url)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group -mx-3 grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-4 px-3 py-4 transition-colors duration-150 hover:bg-paper-deep"
              >
                <span className="caps text-sm text-ink-soft">{t(`kinds.${link.kind}`)}</span>
                <span className="text-lg break-words decoration-1 underline-offset-4 group-hover:underline group-hover:decoration-double">
                  {link.label}
                </span>
                <ArrowUpRight className="self-center" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
