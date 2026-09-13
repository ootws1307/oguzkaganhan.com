import { locales } from "@repo/content";
import type { MetadataRoute } from "next";
import { loadSite } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, settings } = await loadSite();
  const alternates = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
  });

  return [
    ...locales.map((locale) => ({
      url: `${base}/${locale}`,
      lastModified: settings.updated_at,
      alternates: alternates(""),
    })),
    ...projects.flatMap((project) =>
      locales.map((locale) => ({
        url: `${base}/${locale}/projects/${project.slug}`,
        lastModified: project.github?.pushed_at ?? undefined,
        alternates: alternates(`/projects/${project.slug}`),
      })),
    ),
  ];
}
