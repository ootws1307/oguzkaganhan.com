import { type Locale, pickLocale, type Section } from "@repo/content";
import { mediaUrl } from "@repo/db";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";

export async function AboutSheet({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "about" }>;
  site: SiteData;
  locale: Locale;
}) {
  const t = await getTranslations("Sheet");
  const body = pickLocale(section.content, locale)?.body_md.trim();
  const photo = section.options.show_photo ? site.settings.avatar_path : null;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      {photo && (
        <figure className="lg:col-span-4">
          <div className="relative aspect-[4/5] border border-ink bg-photo-ground">
            <Image
              src={mediaUrl(photo)}
              alt={site.settings.site_name}
              fill
              sizes="(min-width: 1024px) 30vw, 90vw"
              className="object-cover mix-blend-multiply grayscale"
            />
          </div>
          <figcaption className="caps mt-2 text-xs text-ink-soft">
            {t("detail")} A — {site.settings.site_name}
          </figcaption>
        </figure>
      )}
      {body && (
        <div className={photo ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="max-w-[68ch] text-lg">
            <Markdown>{body}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
