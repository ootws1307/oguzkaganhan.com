import { describe, expect, test } from "bun:test";
import { type ProjectRow, resolveProject } from "./projects";

const repo: NonNullable<ProjectRow["github_repos"]> = {
  id: 1,
  name: "dotfiles",
  full_name: "ootws1307/dotfiles",
  description: "My dotfiles",
  html_url: "https://github.com/ootws1307/dotfiles",
  homepage: null,
  language: "Shell",
  topics: ["macos", "zsh"],
  stars: 3,
  forks: 0,
  is_fork: false,
  is_archived: false,
  pushed_at: "2026-09-01T00:00:00Z",
  readme_md: "# dotfiles",
  synced_at: "2026-09-01T00:00:00Z",
  removed_at: null,
};

const base: ProjectRow = {
  id: "p1",
  source: "github",
  github_repo_id: 1,
  slug: "dotfiles",
  title: { tr: "", en: "" },
  summary: { tr: "", en: "" },
  body_md: { tr: "", en: "" },
  tech: [],
  repo_url: null,
  live_url: null,
  cover_path: null,
  is_featured: false,
  is_visible: true,
  position: 0,
  started_on: null,
  ended_on: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  github_repos: repo,
};

describe("resolveProject", () => {
  test("empty admin fields inherit repository data", () => {
    const view = resolveProject(base);
    expect(view.title).toEqual({ tr: "dotfiles", en: "dotfiles" });
    expect(view.summary.en).toBe("My dotfiles");
    expect(view.body_md.tr).toBe("# dotfiles");
    expect(view.tech).toEqual(["Shell", "macos", "zsh"]);
    expect(view.repo_url).toBe(repo.html_url);
    expect(view.github?.stars).toBe(3);
    const both = { tr: "repo", en: "repo" } as const;
    expect(view.text_origin).toEqual({ title: both, summary: both, body_md: both });
  });

  test("each locale falls back to repo data on its own", () => {
    // A Turkish-only override must not leak Turkish onto the English page.
    const view = resolveProject({ ...base, title: { tr: "Ayarlarım", en: "" } });
    expect(view.title).toEqual({ tr: "Ayarlarım", en: "dotfiles" });
    expect(view.text_origin.title).toEqual({ tr: "admin", en: "repo" });
  });

  test("a repo without description leaves the summary empty and admin-owned", () => {
    const view = resolveProject({
      ...base,
      summary: { tr: "Kısa", en: "" },
      github_repos: { ...repo, description: null },
    });
    expect(view.summary).toEqual({ tr: "Kısa", en: "" });
    expect(view.text_origin.summary).toEqual({ tr: "admin", en: "admin" });
  });

  test("admin tech list and links override the repository", () => {
    const view = resolveProject({ ...base, tech: ["Nix"], live_url: "https://example.com" });
    expect(view.tech).toEqual(["Nix"]);
    expect(view.live_url).toBe("https://example.com");
  });

  test("custom projects have no github block", () => {
    const view = resolveProject({
      ...base,
      source: "custom",
      github_repo_id: null,
      github_repos: null,
    });
    expect(view.github).toBeNull();
    expect(view.title).toEqual({ tr: "", en: "" });
  });
});
