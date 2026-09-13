import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/** Client Component client. createBrowserClient is a singleton internally. */
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient<Database>(url, key);
}
