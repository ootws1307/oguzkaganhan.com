import { type Locale, pickLocale, type Section } from "@repo/content";
import { mediaUrl } from "@repo/db";
import Image from "next/image";
import { Markdown } from "@/components/markdown";
import type { SiteData } from "@/lib/data";

export function AboutSection({
  section,
  site,
  locale,
}: {
  section: Extract<Section, { key: "about" }>;
  site: SiteData;
  locale: Locale;
}) {
  const body = pickLocale(section.content, locale)?.body_md.trim();
  // The intro already carries the portrait; a second one here would be a duplicate.
  const heroShowsPhoto = site.sections.some(
    (s) => s.key === "hero" && s.is_visible && s.options.show_photo,
  );
  const photo = section.options.show_photo && !heroShowsPhoto ? site.settings.avatar_path : null;

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
      {photo && (
        <div className="lg:col-span-4">
          <div className="aspect-[4/5] w-40 lg:w-full">
            <Image
              src={mediaUrl(photo)}
              alt={site.settings.site_name}
              width={480}
              height={600}
              sizes="(min-width: 1024px) 28vw, 10rem"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
      {body && (
        <div className={photo ? "lg:col-span-8" : "lg:col-span-9"}>
          <div className="max-w-[34rem]">
            <Markdown>{body}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
