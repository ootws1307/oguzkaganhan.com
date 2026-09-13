"use server";

import { type SectionKey, sectionKeys, sectionSchemas } from "@repo/content";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

export async function saveSection(key: SectionKey, input: unknown): Promise<ActionResult> {
  try {
    const sectionKey = z.enum(sectionKeys).parse(key);
    const schema = z.object({
      content: sectionSchemas[sectionKey].content,
      options: sectionSchemas[sectionKey].options,
      is_visible: z.boolean(),
    });
    const values = schema.parse(input);

    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("sections")
      .update({ content: values.content, options: values.options, is_visible: values.is_visible })
      .eq("key", sectionKey);
    if (error) throw error;

    return { ok: true, revalidated: await revalidateSite(["sections"]) };
  } catch (error) {
    return failure(error);
  }
}
