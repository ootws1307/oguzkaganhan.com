"use server";

import { createClient } from "@repo/db/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3001";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
