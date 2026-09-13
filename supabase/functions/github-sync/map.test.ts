import { describe, expect, test } from "bun:test";
import {
  findRemovedRepoIds,
  type GithubApiRepo,
  needsReadme,
  planNewProjects,
  slugify,
  toRepoRow,
  uniqueSlug,
} from "./map.ts";

const repo = (overrides: Partial<GithubApiRepo> = {}): GithubApiRepo => ({
  id: 1,
  name: "my-repo",
  full_name: "ootws1307/my-repo",
  description: "  A repo  ",
  html_url: "https://github.com/ootws1307/my-repo",
  homepage: "",
  language: "TypeScript",
  topics: ["web"],
  stargazers_count: 2,
  forks_count: 1,
  fork: false,
  archived: false,
  private: false,
  pushed_at: "2026-09-01T10:00:00Z",
  ...overrides,
});

describe("toRepoRow", () => {
  test("maps API fields and normalises empty strings to null", () => {
    const row = toRepoRow(repo(), "2026-09-11T00:00:00Z");
    expect(row).toMatchObject({
      id: 1,
      description: "A repo",
      homepage: null,
      stars: 2,
      forks: 1,
      topics: ["web"],
      removed_at: null,
    });
  });

  test("missing topics become an empty list", () => {
    expect(toRepoRow(repo({ topics: undefined }), "t").topics).toEqual([]);
  });
});

describe("slugify", () => {
  test("produces database-valid slugs", () => {
    expect(slugify("My_Cool.Repo")).toBe("my-cool-repo");
    expect(slugify("--dotfiles--")).toBe("dotfiles");
    expect(slugify("Işık Çalışması")).toBe("isik-calismasi");
  });

  test("non-latin-only names slugify to empty (caller falls back)", () => {
    expect(slugify("日本")).toBe("");
  });
});

describe("uniqueSlug", () => {
  test("appends a counter on collision and reserves the result", () => {
    const taken = new Set(["app", "app-2"]);
    expect(uniqueSlug("app", taken, "repo-1")).toBe("app-3");
    expect(taken.has("app-3")).toBe(true);
  });

  test("uses the fallback when the base is empty", () => {
    expect(uniqueSlug("", new Set(), "repo-9")).toBe("repo-9");
  });
});

describe("planNewProjects", () => {
  const repos = [
    repo({ id: 1, name: "linked" }),
    repo({ id: 2, name: "fresh" }),
    repo({ id: 3, name: "forked", fork: true }),
    repo({ id: 4, name: "secret", private: true }),
  ];

  test("skips linked and private repos and continues positions", () => {
    const rows = planNewProjects(repos, new Set([1]), new Set(), true, 10);
    expect(rows.map((r) => [r.github_repo_id, r.slug, r.position])).toEqual([
      [2, "fresh", 10],
      [3, "forked", 11],
    ]);
  });

  test("auto-publish shows new repos but never forks", () => {
    const rows = planNewProjects(repos, new Set([1]), new Set(), true, 0);
    expect(rows.find((r) => r.github_repo_id === 2)?.is_visible).toBe(true);
    expect(rows.find((r) => r.github_repo_id === 3)?.is_visible).toBe(false);
  });

  test("without auto-publish everything starts hidden", () => {
    const rows = planNewProjects(repos, new Set(), new Set(), false, 0);
    expect(rows.every((r) => !r.is_visible)).toBe(true);
  });
});

describe("needsReadme", () => {
  const stored = { pushed_at: "2026-07-24T17:34:31+00:00", readme_md: "# hi" };

  test("the same instant in Postgres and GitHub formats is unchanged", () => {
    expect(needsReadme(stored, "2026-07-24T17:34:31Z")).toBe(false);
  });

  test("a newer push, a new repo or a missing README refetches", () => {
    expect(needsReadme(stored, "2026-07-25T09:00:00Z")).toBe(true);
    expect(needsReadme(undefined, "2026-07-24T17:34:31Z")).toBe(true);
    expect(needsReadme({ ...stored, readme_md: null }, "2026-07-24T17:34:31Z")).toBe(true);
  });
});

describe("findRemovedRepoIds", () => {
  test("returns stored repos GitHub no longer lists publicly", () => {
    const fetched = [repo({ id: 1 }), repo({ id: 2, private: true })];
    expect(findRemovedRepoIds([1, 2, 3], fetched)).toEqual([2, 3]);
  });
});
