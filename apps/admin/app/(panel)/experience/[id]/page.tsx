import { getExperiences } from "@repo/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Kayıt" };

export default async function ExperienceItemPage({ params }: PageProps<"/experience/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const item = (await getExperiences(supabase)).find((e) => e.id === id);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={item.organization}
        back={<BackLink href="/experience">Deneyim ve eğitim</BackLink>}
      />
      <ExperienceForm
        id={item.id}
        initial={{
          kind: item.kind,
          organization: item.organization,
          role: item.role,
          location: item.location,
          url: item.url ?? "",
          description_md: item.description_md,
          started_on: item.started_on,
          ended_on: item.ended_on ?? "",
          is_visible: item.is_visible,
        }}
      />
    </>
  );
}
