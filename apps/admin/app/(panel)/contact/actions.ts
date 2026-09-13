"use server";

import { contactLinkInputSchema } from "@repo/content";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

export async function createContactLink(): Promise<ActionResult<{ id: string; position: number }>> {
  try {
    const { supabase } = await requireAdmin();
    const { data: last } = await supabase
      .from("contact_links")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.position ?? -1) + 1;
    // Starts hidden so a half-filled link never reaches the site.
    const { data, error } = await supabase
      .from("contact_links")
      .insert({
        kind: "website",
        label: "Yeni bağlantı",
        url: "https://",
        is_visible: false,
        position,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, revalidated: false, data: { id: data.id, position } };
  } catch (error) {
    return failure(error);
  }
}

export async function updateContactLink(id: string, input: unknown): Promise<ActionResult> {
  try {
    const values = contactLinkInputSchema.parse(input);
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("contact_links")
      .update(values)
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(["contact_links"]) };
  } catch (error) {
    return failure(error);
  }
}
