"use server";

import { experienceInputSchema } from "@repo/content";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

export async function saveExperience(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const values = experienceInputSchema.parse(input);
    const { supabase } = await requireAdmin();
    const row = { ...values, url: values.url || null };

    if (id) {
      const { error } = await supabase.from("experiences").update(row).eq("id", z.uuid().parse(id));
      if (error) throw error;
      return { ok: true, revalidated: await revalidateSite(["experiences"]), data: { id } };
    }

    const { data: last } = await supabase
      .from("experiences")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("experiences")
      .insert({ ...row, position: (last?.position ?? -1) + 1 })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(["experiences"]), data: { id: data.id } };
  } catch (error) {
    return failure(error);
  }
}
