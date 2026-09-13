import { type ProjectRow, resolveProject } from "@repo/db";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { ProjectsRegister } from "./projects-register";

export const metadata: Metadata = { title: "Projeler" };

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*, github_repos(*)")
    .order("position");
  if (error) throw error;

  const rows = (data as ProjectRow[]).map((row) => {
    const view = resolveProject(row);
    return {
      id: row.id,
      title: view.title.tr || view.title.en || row.slug,
      // Repo names are English; keeps CSS uppercase from turning "i" into "İ" on this lang="tr" page.
      titleLang: view.text_origin.title.tr === "repo" ? ("en" as const) : undefined,
      source: row.source,
      is_visible: row.is_visible,
      is_featured: row.is_featured,
      repo: row.github_repos
        ? {
            full_name: row.github_repos.full_name,
            is_fork: row.github_repos.is_fork,
            removed: !!row.github_repos.removed_at,
          }
        : null,
    };
  });

  return (
    <>
      <PageHeader
        title="Projeler"
        description="GitHub'dan senkronize edilen repolar gizli olarak gelir. Sitede göstermek istediklerini aç, sırala, öne çıkar."
        actions={
          <Link href="/projects/new" className={buttonVariants({ className: "caps px-3" })}>
            <Plus aria-hidden />
            Yeni proje
          </Link>
        }
      />
      <div className="px-5 py-6 sm:px-8">
        <ProjectsRegister projects={rows} />
      </div>
    </>
  );
}
