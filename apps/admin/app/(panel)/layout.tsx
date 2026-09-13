import { getSiteSettings } from "@repo/db";
import { Rail } from "@/components/rail";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, claims } = await requireAdmin();
  const settings = await getSiteSettings(supabase);
  const login = (claims.user_metadata as { user_name?: string } | undefined)?.user_name;

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <Rail
        siteName={settings.site_name}
        webUrl={process.env.WEB_URL ?? "http://localhost:3000"}
        lastSync={settings.last_github_sync_at}
        login={login ?? null}
      />
      <main id="main" className="min-w-0 pb-24">
        {children}
      </main>
    </div>
  );
}
