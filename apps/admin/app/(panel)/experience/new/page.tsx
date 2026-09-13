import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ExperienceForm } from "../experience-form";

export const metadata: Metadata = { title: "Yeni kayıt" };

export default async function NewExperiencePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Yeni kayıt"
        back={<BackLink href="/experience">Deneyim ve eğitim</BackLink>}
      />
      <ExperienceForm
        id={null}
        initial={{
          kind: "work",
          organization: "",
          role: { tr: "", en: "" },
          location: "",
          url: "",
          description_md: { tr: "", en: "" },
          started_on: "",
          ended_on: "",
          is_visible: true,
        }}
      />
    </>
  );
}
