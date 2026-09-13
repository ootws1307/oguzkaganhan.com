"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

// Generic row operations shared by every register. Table names are whitelisted
// here; RLS still decides whether the signed-in user may write at all.

const orderedTables = z.enum([
  "sections",
  "projects",
  "project_images",
  "experiences",
  "skill_groups",
  "skills",
  "contact_links",
]);
const visibleTables = z.enum([
  "sections",
  "projects",
  "experiences",
  "skill_groups",
  "contact_links",
]);
const deletableTables = z.enum([
  "projects",
  "project_images",
  "experiences",
  "skill_groups",
  "skills",
  "contact_links",
]);

/** Which cached tables on the site a change to `table` affects. */
function tagsFor(table: string): string[] {
  if (table === "skills" || table === "skill_groups") return ["skills", "skill_groups"];
  if (table === "project_images") return ["project_images", "projects"];
  return [table];
}

export async function reorderRows(table: string, ids: string[]): Promise<ActionResult> {
  try {
    const t = orderedTables.parse(table);
    const list = z.array(z.uuid()).max(500).parse(ids);
    const { supabase } = await requireAdmin();
    const results = await Promise.all(
      list.map((id, position) => supabase.from(t).update({ position }).eq("id", id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    return { ok: true, revalidated: await revalidateSite(tagsFor(t)) };
  } catch (error) {
    return failure(error);
  }
}

export async function setVisible(
  table: string,
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  try {
    const t = visibleTables.parse(table);
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from(t)
      .update({ is_visible: z.boolean().parse(visible) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(tagsFor(t)) };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteRow(table: string, id: string): Promise<ActionResult> {
  try {
    const t = deletableTables.parse(table);
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from(t).delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(tagsFor(t)) };
  } catch (error) {
    return failure(error);
  }
}

/** Runs the github-sync edge function as the signed-in admin. */
export async function syncGithub(): Promise<
  ActionResult<{ fetched: number; created: number; removed: number }>
> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.functions.invoke("github-sync", { method: "POST" });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error ?? "Senkronizasyon başarısız.");
    return {
      ok: true,
      revalidated: data.revalidated === true,
      data: { fetched: data.fetched, created: data.created, removed: data.removed },
    };
  } catch (error) {
    return failure(error);
  }
}
