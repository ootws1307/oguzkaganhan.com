import { type SectionKey, sectionKeys } from "@repo/content";
import { getSections } from "@repo/db";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { SECTION_LABELS } from "../sections-register";
import { SectionForm } from "./section-form";

export async function generateMetadata({
  params,
}: PageProps<"/sections/[key]">): Promise<Metadata> {
  const { key } = await params;
  return { title: SECTION_LABELS[key as SectionKey] ?? "Bölüm" };
}

export default async function SectionPage({ params }: PageProps<"/sections/[key]">) {
  const { key } = await params;
  if (!(sectionKeys as readonly string[]).includes(key)) notFound();

  const { supabase } = await requireAdmin();
  const section = (await getSections(supabase)).find((s) => s.key === key);
  if (!section) notFound();

  return (
    <>
      <PageHeader
        title={SECTION_LABELS[section.key]}
        back={
          <Link
            href="/sections"
            className="caps inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Bölümler
          </Link>
        }
      />
      <SectionForm
        sectionKey={section.key}
        initial={{
          content: section.content,
          options: section.options,
          is_visible: section.is_visible,
        }}
      />
    </>
  );
}
