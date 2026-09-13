// Pure mapping from the GitHub REST API to database rows. No I/O here, so it
// runs the same under Deno (edge function) and Bun (tests).

/** The fields we read from `GET /users/{username}/repos`. */
export type GithubApiRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string | null;
};

export type RepoRow = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  is_fork: boolean;
  is_archived: boolean;
  pushed_at: string | null;
  synced_at: string;
  removed_at: null;
};

export type NewProjectRow = {
  source: "github";
  github_repo_id: number;
  slug: string;
  is_visible: boolean;
  position: number;
};

export function toRepoRow(repo: GithubApiRepo, syncedAt: string): RepoRow {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description?.trim() || null,
    html_url: repo.html_url,
    homepage: repo.homepage?.trim() || null,
    language: repo.language,
    topics: repo.topics ?? [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    is_fork: repo.fork,
    is_archived: repo.archived,
    pushed_at: repo.pushed_at,
    synced_at: syncedAt,
    removed_at: null,
  };
}

/** Matches the database check `^[a-z0-9]+(-[a-z0-9]+)*$`. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, taken: Set<string>, fallback: string): string {
  const root = base || fallback;
  let slug = root;
  for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`;
  taken.add(slug);
  return slug;
}

/**
 * Project rows for repositories that do not have one yet. New repos are hidden
 * unless the owner enabled auto-publish; forks and archived repos always start hidden.
 * `takenSlugs` is updated in place so the caller can keep using it.
 */
export function planNewProjects(
  repos: GithubApiRepo[],
  linkedRepoIds: Set<number>,
  takenSlugs: Set<string>,
  autoPublish: boolean,
  startPosition: number,
): NewProjectRow[] {
  let position = startPosition;
  return repos
    .filter((repo) => !repo.private && !linkedRepoIds.has(repo.id))
    .map((repo) => ({
      source: "github" as const,
      github_repo_id: repo.id,
      slug: uniqueSlug(slugify(repo.name), takenSlugs, `repo-${repo.id}`),
      is_visible: autoPublish && !repo.fork && !repo.archived,
      position: position++,
    }));
}

/**
 * Whether to fetch a repo's README again: only when it is new, has no README
 * stored, or was pushed since. Compared as instants, because Postgres returns
 * "…+00:00" where GitHub sends "…Z" for the same moment.
 */
export function needsReadme(
  stored: { pushed_at: string | null; readme_md: string | null } | undefined,
  pushedAt: string | null,
): boolean {
  if (!stored || stored.readme_md == null) return true;
  const instant = (value: string | null) => (value ? Date.parse(value) : null);
  return instant(stored.pushed_at) !== instant(pushedAt);
}

/** Repos we stored earlier that GitHub no longer returns (deleted, renamed away, made private). */
export function findRemovedRepoIds(storedIds: number[], fetched: GithubApiRepo[]): number[] {
  const current = new Set(fetched.filter((r) => !r.private).map((r) => r.id));
  return storedIds.filter((id) => !current.has(id));
}
