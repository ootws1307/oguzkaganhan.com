import { type Localized, locales, localizedText } from "@repo/content";
import type { Json, Tables } from "./database.types";

export type ProjectRow = Tables<"projects"> & { github_repos: Tables<"github_repos"> | null };

export type TextOrigin = "admin" | "repo";

export type ProjectView = {
  id: string;
  slug: string;
  source: Tables<"projects">["source"];
  title: Localized<string>;
  summary: Localized<string>;
  body_md: Localized<string>;
  /**
   * Where each locale's text came from. Repo text (name, description, README) is
   * in the repo's own language, not the page's, which matters for uppercase rules.
   */
  text_origin: {
    title: Localized<TextOrigin>;
    summary: Localized<TextOrigin>;
    body_md: Localized<TextOrigin>;
  };
  tech: string[];
  repo_url: string | null;
  live_url: string | null;
  cover_path: string | null;
  is_featured: boolean;
  is_visible: boolean;
  position: number;
  started_on: string | null;
  ended_on: string | null;
  github: {
    full_name: string;
    stars: number;
    forks: number;
    language: string | null;
    pushed_at: string | null;
    is_archived: boolean;
  } | null;
};

function asLocalized(value: Json): Localized<string> {
  const parsed = localizedText.safeParse(value);
  return parsed.success ? parsed.data : { tr: "", en: "" };
}

/**
 * Per locale: admin text wins, and an empty locale takes the repository's data,
 * as the admin form promises ("empty fields are filled from the repo"). Only a
 * locale with neither stays empty, for pickLocale to fill from the other locale.
 */
function withFallback(
  value: Json,
  fallback: string | null | undefined,
): [Localized<string>, Localized<TextOrigin>] {
  const text = asLocalized(value);
  const origin: Localized<TextOrigin> = { tr: "admin", en: "admin" };
  for (const locale of locales) {
    if (!text[locale].trim() && fallback) {
      text[locale] = fallback;
      origin[locale] = "repo";
    }
  }
  return [text, origin];
}

export function resolveProject(row: ProjectRow): ProjectView {
  const repo = row.github_repos;
  const repoTech = repo ? [repo.language, ...repo.topics].filter((t): t is string => !!t) : [];
  const [title, titleOrigin] = withFallback(row.title, repo?.name);
  const [summary, summaryOrigin] = withFallback(row.summary, repo?.description);
  const [body_md, bodyOrigin] = withFallback(row.body_md, repo?.readme_md);

  return {
    id: row.id,
    slug: row.slug,
    source: row.source,
    title,
    summary,
    body_md,
    text_origin: { title: titleOrigin, summary: summaryOrigin, body_md: bodyOrigin },
    tech: row.tech.length > 0 ? row.tech : repoTech,
    repo_url: row.repo_url || repo?.html_url || null,
    live_url: row.live_url || repo?.homepage || null,
    cover_path: row.cover_path,
    is_featured: row.is_featured,
    is_visible: row.is_visible,
    position: row.position,
    started_on: row.started_on,
    ended_on: row.ended_on,
    github: repo
      ? {
          full_name: repo.full_name,
          stars: repo.stars,
          forks: repo.forks,
          language: repo.language,
          pushed_at: repo.pushed_at,
          is_archived: repo.is_archived,
        }
      : null,
  };
}
