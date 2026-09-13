import { createClient } from "@repo/db/server";
import { redirect } from "next/navigation";

/**
 * Every page and server action goes through this. RLS already refuses writes
 * from anyone but the admin; this turns a stale or foreign session into a
 * redirect instead of a silent empty result.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/login?error=forbidden");

  return { supabase, claims: data.claims };
}
