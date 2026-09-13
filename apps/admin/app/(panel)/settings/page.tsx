import type { Localized } from "@repo/content";
import { getSiteSettings } from "@repo/db";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site ayarları" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSiteSettings(supabase);

  return (
    <>
      <PageHeader
        title="Site ayarları"
        description="İsim, arama motoru metinleri, profil fotoğrafı, CV ve GitHub senkronizasyonu."
      />
      <SettingsForm
        initial={{
          site_name: settings.site_name,
          seo_title: settings.seo_title as Localized<string>,
          seo_description: settings.seo_description as Localized<string>,
          og_image_path: settings.og_image_path,
          avatar_path: settings.avatar_path,
          cv_paths: settings.cv_paths as Localized<string | null>,
          github_username: settings.github_username,
          auto_publish_new_repos: settings.auto_publish_new_repos,
        }}
      />
    </>
  );
}
