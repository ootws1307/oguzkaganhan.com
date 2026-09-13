import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";
export type { DbClient } from "./env";
export * from "./images";
export * from "./projects";
export * from "./queries";

/**
 * Cookie-less client with the publishable key. Sees exactly what a visitor sees
 * (RLS: visible rows only), so it is safe inside cached functions. Pass a custom
 * `fetch` to control caching (the public site tags every request).
 */
export function createPublicClient(options: { fetch?: typeof fetch } = {}) {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: options.fetch ? { fetch: options.fetch } : undefined,
  });
}

/** Public URL of a file in the `media` storage bucket. */
export function mediaUrl(path: string): string {
  const { url } = supabaseEnv();
  return `${url}/storage/v1/object/public/media/${path.split("/").map(encodeURIComponent).join("/")}`;
}
