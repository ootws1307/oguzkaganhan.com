import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type DbClient = SupabaseClient<Database>;

export function supabaseEnv() {
  // Read as literal `process.env.NEXT_PUBLIC_*` so Next.js can inline them for the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return { url, key };
}
