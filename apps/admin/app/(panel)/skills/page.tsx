import { getSkillGroups } from "@repo/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { SkillsEditor } from "./skills-editor";

export const metadata: Metadata = { title: "Yetenekler" };

export default async function SkillsPage() {
  const { supabase } = await requireAdmin();
  const groups = await getSkillGroups(supabase);

  return (
    <>
      <PageHeader
        title="Yetenekler"
        description="Gruplar sitede lejant sütunları olarak çizilir. Değişiklikler anında kaydedilir."
      />
      <div className="px-5 py-6 sm:px-8">
        <SkillsEditor initial={groups} />
      </div>
    </>
  );
}
