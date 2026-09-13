import type { Localized } from "@repo/content";
import { getProjectImages, type ProjectRow } from "@repo/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ImagesManager } from "../images-manager";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Proje" };

const text = (value: unknown) => value as Localized<string>;

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("projects")
    .select("*, github_repos(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const row = data as ProjectRow;
  const repo = row.github_repos;
  const images = await getProjectImages(supabase, row.id);
  const title = text(row.title);
  const ownTitle = title.tr || title.en;

  return (
    <>
      <PageHeader
        title={ownTitle || repo?.name || row.slug}
        titleLang={ownTitle ? undefined : "en"}
        description={
          repo
            ? `GitHub: ${repo.full_name}. Boş bıraktığın alanlar repodan doldurulur.`
            : "El ile eklenmiş proje."
        }
        back={<BackLink href="/projects">Projeler</BackLink>}
      />
      <ProjectForm
        id={row.id}
        repo={
          repo
            ? {
                name: repo.name,
                description: repo.description,
                hasReadme: !!repo.readme_md,
                html_url: repo.html_url,
                homepage: repo.homepage,
                tech: [repo.language, ...repo.topics].filter((t): t is string => !!t),
              }
            : null
        }
        initial={{
          slug: row.slug,
          title,
          summary: text(row.summary),
          body_md: text(row.body_md),
          tech: row.tech.join(", "),
          repo_url: row.repo_url ?? "",
          live_url: row.live_url ?? "",
          cover_path: row.cover_path,
          is_featured: row.is_featured,
          is_visible: row.is_visible,
          started_on: row.started_on ?? "",
          ended_on: row.ended_on ?? "",
        }}
      >
        <ImagesManager projectId={row.id} initial={images} />
      </ProjectForm>
    </>
  );
}
