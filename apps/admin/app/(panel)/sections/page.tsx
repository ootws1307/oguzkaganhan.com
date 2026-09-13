import { getSections } from "@repo/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { SectionsRegister } from "./sections-register";

export const metadata: Metadata = { title: "Bölümler" };

export default async function SectionsPage() {
  const { supabase } = await requireAdmin();
  const sections = await getSections(supabase);

  return (
    <>
      <PageHeader
        title="Bölümler"
        description="Ana sayfadaki bölümler. Sürükleyerek sırala, anahtarla gizle/göster, içeriği düzenlemek için bir satırı aç."
      />
      <div className="px-5 py-6 sm:px-8">
        <SectionsRegister
          sections={sections.map((s) => ({
            id: s.id,
            key: s.key,
            is_visible: s.is_visible,
            title: s.content.tr.title || s.content.en.title,
          }))}
        />
      </div>
    </>
  );
}
