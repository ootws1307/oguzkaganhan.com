import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Tags are table names (see lib/data.ts) plus the umbrella tag "site".
const KNOWN_TAGS = new Set([
  "site",
  "site_settings",
  "sections",
  "projects",
  "github_repos",
  "project_images",
  "experiences",
  "skill_groups",
  "skills",
  "contact_links",
]);

function authorized(request: Request): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret");
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string" && KNOWN_TAGS.has(tag))
    : [];

  // Called from outside a Server Action, so expire immediately: the owner expects
  // to see a save on the next page load, not the one after.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: tags });
}
