import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Yeni proje" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Yeni proje"
        description="GitHub'da olmayan bir proje ekle. Ekran görüntülerini kaydettikten sonra ekleyebilirsin."
        back={<BackLink href="/projects">Projeler</BackLink>}
      />
      <ProjectForm
        id={null}
        repo={null}
        initial={{
          slug: "",
          title: { tr: "", en: "" },
          summary: { tr: "", en: "" },
          body_md: { tr: "", en: "" },
          tech: "",
          repo_url: "",
          live_url: "",
          cover_path: null,
          is_featured: false,
          is_visible: false,
          started_on: "",
          ended_on: "",
        }}
      />
    </>
  );
}
