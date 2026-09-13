"use server";

import { siteSettingsInputSchema } from "@repo/content";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

export async function saveSettings(input: unknown): Promise<ActionResult> {
  try {
    const values = siteSettingsInputSchema.parse(input);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_settings").update(values).eq("id", true);
    if (error) throw error;
    // The name and photo appear on every sheet, so refresh everything.
    return { ok: true, revalidated: await revalidateSite(["site"]) };
  } catch (error) {
    return failure(error);
  }
}
