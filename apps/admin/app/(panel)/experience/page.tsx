import { getExperiences } from "@repo/db";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { ExperienceRegister } from "./experience-register";

export const metadata: Metadata = { title: "Deneyim ve eğitim" };

export default async function ExperiencePage() {
  const { supabase } = await requireAdmin();
  const experiences = await getExperiences(supabase);

  return (
    <>
      <PageHeader
        title="Deneyim ve eğitim"
        description="İş, staj ve eğitim kayıtları. Sitede türüne göre gruplanır, her grup içinde buradaki sırayla görünür."
        actions={
          <Link href="/experience/new" className={buttonVariants({ className: "caps px-3" })}>
            <Plus aria-hidden />
            Yeni kayıt
          </Link>
        }
      />
      <div className="px-5 py-6 sm:px-8">
        <ExperienceRegister
          items={experiences.map((e) => ({
            id: e.id,
            kind: e.kind,
            organization: e.organization,
            role: e.role.tr || e.role.en,
            started_on: e.started_on,
            ended_on: e.ended_on,
            is_visible: e.is_visible,
          }))}
        />
      </div>
    </>
  );
}
