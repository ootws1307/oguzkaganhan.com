// Syncs the owner's public GitHub repositories into `github_repos` and opens a
// (hidden by default) `projects` row for every new one.
//
// Callers:
//   - pg_cron, every 6 hours, authenticated with the `x-sync-secret` header
//   - the admin panel's "Sync now" button, authenticated with the admin's JWT
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.116.0";
import {
  findRemovedRepoIds,
  type GithubApiRepo,
  needsReadme,
  planNewProjects,
  toRepoRow,
} from "./map.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const SYNC_SECRET = Deno.env.get("SYNC_SECRET");
const REVALIDATE_URL = Deno.env.get("REVALIDATE_URL");
const REVALIDATE_SECRET = Deno.env.get("REVALIDATE_SECRET");

function apiKey(kind: "PUBLISHABLE" | "SECRET"): string {
  const keys = Deno.env.get(`SUPABASE_${kind}_KEYS`);
  if (keys) return JSON.parse(keys).default;
  return Deno.env.get(kind === "SECRET" ? "SUPABASE_SERVICE_ROLE_KEY" : "SUPABASE_ANON_KEY")!;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function isAuthorized(req: Request): Promise<boolean> {
  const secret = req.headers.get("x-sync-secret");
  if (SYNC_SECRET && secret && secret === SYNC_SECRET) return true;

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  // Ask the database, as this user, whether they are the admin.
  const asUser = createClient(SUPABASE_URL, apiKey("PUBLISHABLE"), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data } = await asUser.rpc("is_admin");
  return data === true;
}

function githubHeaders(accept: string): HeadersInit {
  return {
    Accept: accept,
    "User-Agent": "oguzkaganhan.com-sync",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  };
}

async function fetchAllRepos(username: string): Promise<GithubApiRepo[]> {
  const repos: GithubApiRepo[] = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100&page=${page}`;
    const res = await fetch(url, { headers: githubHeaders("application/vnd.github+json") });
    if (!res.ok) throw new Error(`GitHub repos request failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as GithubApiRepo[];
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function fetchReadme(fullName: string): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: githubHeaders("application/vnd.github.raw+json"),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`README request for ${fullName} failed: ${res.status}`);
  return await res.text();
}

async function sync(db: SupabaseClient) {
  const now = new Date().toISOString();

  const { data: settings, error: settingsError } = await db
    .from("site_settings")
    .select("github_username, auto_publish_new_repos")
    .single();
  if (settingsError) throw settingsError;

  const fetched = await fetchAllRepos(settings.github_username);
  const publicRepos = fetched.filter((r) => !r.private);

  const { data: stored, error: storedError } = await db
    .from("github_repos")
    .select("id, pushed_at, readme_md");
  if (storedError) throw storedError;
  const storedById = new Map(stored.map((r) => [r.id as number, r]));

  // Upsert repo data. README is only refetched when the repo changed since last sync.
  const rows = [];
  let readmesFetched = 0;
  for (const repo of publicRepos) {
    const previous = storedById.get(repo.id);
    const changed = needsReadme(previous, repo.pushed_at);
    const readme = changed ? await fetchReadme(repo.full_name) : (previous?.readme_md ?? null);
    if (changed) readmesFetched++;
    rows.push({ ...toRepoRow(repo, now), readme_md: readme });
  }
  if (rows.length > 0) {
    const { error } = await db.from("github_repos").upsert(rows);
    if (error) throw error;
  }

  // Mark vanished repos and hide their projects.
  const removedIds = findRemovedRepoIds([...storedById.keys()], fetched);
  if (removedIds.length > 0) {
    const { error: removeError } = await db
      .from("github_repos")
      .update({ removed_at: now })
      .in("id", removedIds)
      .is("removed_at", null);
    if (removeError) throw removeError;
    const { error: hideError } = await db
      .from("projects")
      .update({ is_visible: false })
      .in("github_repo_id", removedIds);
    if (hideError) throw hideError;
  }

  // Open a project row for each repo that has none yet.
  const { data: projects, error: projectsError } = await db
    .from("projects")
    .select("slug, github_repo_id, position");
  if (projectsError) throw projectsError;
  const linked = new Set(
    projects.map((p) => p.github_repo_id).filter((id): id is number => id != null),
  );
  const takenSlugs = new Set(projects.map((p) => p.slug as string));
  const nextPosition = projects.reduce((max, p) => Math.max(max, p.position + 1), 0);
  const newProjects = planNewProjects(
    publicRepos,
    linked,
    takenSlugs,
    settings.auto_publish_new_repos,
    nextPosition,
  );
  if (newProjects.length > 0) {
    const { error } = await db.from("projects").insert(newProjects);
    if (error) throw error;
  }

  const { error: stampError } = await db
    .from("site_settings")
    .update({ last_github_sync_at: now })
    .eq("id", true);
  if (stampError) throw stampError;

  return {
    fetched: publicRepos.length,
    readmesFetched,
    created: newProjects.length,
    removed: removedIds.length,
  };
}

async function revalidateSite() {
  if (!REVALIDATE_URL || !REVALIDATE_SECRET) return false;
  try {
    const res = await fetch(REVALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": REVALIDATE_SECRET },
      // Tags are table names; the site tags every cached read with the table it hits.
      body: JSON.stringify({ tags: ["projects", "github_repos", "site_settings"] }),
    });
    if (!res.ok) console.error(`revalidate: ${REVALIDATE_URL} answered ${res.status}`);
    return res.ok;
  } catch (error) {
    // The site may be offline locally; the sync itself still succeeded.
    console.error(`revalidate: ${REVALIDATE_URL} unreachable:`, error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await isAuthorized(req))) return json({ error: "Unauthorized" }, 401);

  const db = createClient(SUPABASE_URL, apiKey("SECRET"), { auth: { persistSession: false } });
  try {
    const result = await sync(db);
    const revalidated = await revalidateSite();
    return json({ ok: true, ...result, revalidated });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
