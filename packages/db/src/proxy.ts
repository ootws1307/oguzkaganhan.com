import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Refreshes the auth token for this request and returns the verified claims.
 * Must run in the app's proxy.ts so refreshed cookies reach both the
 * Server Components (request) and the browser (response).
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = supabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Cache headers that stop a CDN from caching a response carrying a session.
        for (const [header, value] of Object.entries(headers ?? {})) {
          response.headers.set(header, value);
        }
      },
    },
  });

  // getClaims() verifies the JWT signature; never trust getSession() here.
  const { data } = await supabase.auth.getClaims();
  return { response, claims: data?.claims ?? null };
}
