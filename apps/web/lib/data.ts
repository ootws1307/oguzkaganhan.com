import {
  createPublicClient,
  getContactLinks,
  getExperiences,
  getProjectBySlug,
  getProjectImages,
  getProjects,
  getSections,
  getSiteSettings,
  getSkillGroups,
} from "@repo/db";
import { cache } from "react";

/**
 * Every Supabase REST read is cached and tagged with the table it hits, plus the
 * umbrella tag "site". The admin panel and the GitHub sync call /api/revalidate
 * with table names after they write, so pages refresh without a redeploy.
 */
const taggedFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const table = /\/rest\/v1\/([^/?]+)/.exec(url)?.[1];
  return fetch(input, {
    ...init,
    cache: "force-cache",
    next: { tags: table ? ["site", table] : ["site"] },
  });
};

const client = () => createPublicClient({ fetch: taggedFetch });

export const loadSite = cache(async () => {
  const db = client();
  const [settings, sections, projects, experiences, skillGroups, contactLinks] = await Promise.all([
    getSiteSettings(db),
    getSections(db),
    getProjects(db),
    getExperiences(db),
    getSkillGroups(db),
    getContactLinks(db),
  ]);
  return { settings, sections, projects, experiences, skillGroups, contactLinks };
});

export type SiteData = Awaited<ReturnType<typeof loadSite>>;

export const loadProject = cache(async (slug: string) => {
  const db = client();
  const project = await getProjectBySlug(db, slug);
  if (!project) return null;
  const images = await getProjectImages(db, project.id);
  return { project, images };
});
