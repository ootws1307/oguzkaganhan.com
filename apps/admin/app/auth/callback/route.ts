import { createClient } from "@repo/db/server";
import { NextResponse } from "next/server";

/** GitHub → Supabase Auth → here: trade the one-time code for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }

  // The signup hook rejects every GitHub account except the owner's.
  const reason = searchParams.get("error") ? "denied" : "callback";
  return NextResponse.redirect(`${origin}/login?error=${reason}`);
}
