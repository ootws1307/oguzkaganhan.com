import { getContactLinks } from "@repo/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { ContactEditor } from "./contact-editor";

export const metadata: Metadata = { title: "İletişim" };

export default async function ContactPage() {
  const { supabase } = await requireAdmin();
  const links = await getContactLinks(supabase);

  return (
    <>
      <PageHeader
        title="İletişim"
        description="Sitenin son bölümündeki bağlantılar. CV yüklenmemişse girişteki buton ilk bağlantıya gider."
      />
      <div className="px-5 py-6 sm:px-8">
        <ContactEditor initial={links} />
      </div>
    </>
  );
}
