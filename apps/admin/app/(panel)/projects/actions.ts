"use server";

import { localizedText, projectInputSchema } from "@repo/content";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

const nullIfEmpty = (v: string) => (v.trim() ? v.trim() : null);

export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ is_featured: z.boolean().parse(featured) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(["projects"]) };
  } catch (error) {
    return failure(error);
  }
}

/** Creates a hand-added project (id = null) or updates any project. */
export async function saveProject(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const values = projectInputSchema.parse(input);
    const { supabase } = await requireAdmin();
    const row = {
      ...values,
      repo_url: nullIfEmpty(values.repo_url),
      live_url: nullIfEmpty(values.live_url),
    };

    let projectId = id;
    if (id) {
      const { error } = await supabase.from("projects").update(row).eq("id", z.uuid().parse(id));
      if (error) throw error;
    } else {
      const { data: last } = await supabase
        .from("projects")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...row, source: "custom", position: (last?.position ?? -1) + 1 })
        .select("id")
        .single();
      if (error) throw error;
      projectId = data.id;
    }

    return {
      ok: true,
      revalidated: await revalidateSite(["projects"]),
      data: { id: projectId as string },
    };
  } catch (error) {
    return failure(error);
  }
}

/** Only hand-added projects can be deleted; GitHub ones would come back on the next sync. */
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const projectId = z.uuid().parse(id);
    const { data: images } = await supabase
      .from("project_images")
      .select("path")
      .eq("project_id", projectId);
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("source", "custom");
    if (error) throw error;
    if (images?.length) await supabase.storage.from("media").remove(images.map((i) => i.path));
    return { ok: true, revalidated: await revalidateSite(["projects", "project_images"]) };
  } catch (error) {
    return failure(error);
  }
}

const imageInput = z.object({
  path: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export async function addProjectImage(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; position: number }>> {
  try {
    const image = imageInput.parse(input);
    const { supabase } = await requireAdmin();
    const pid = z.uuid().parse(projectId);
    const { data: last } = await supabase
      .from("project_images")
      .select("position")
      .eq("project_id", pid)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.position ?? -1) + 1;
    const { data, error } = await supabase
      .from("project_images")
      .insert({ project_id: pid, ...image, position })
      .select("id")
      .single();
    if (error) throw error;
    return {
      ok: true,
      revalidated: await revalidateSite(["project_images"]),
      data: { id: data.id, position },
    };
  } catch (error) {
    return failure(error);
  }
}

export async function updateProjectImageAlt(id: string, alt: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("project_images")
      .update({ alt: localizedText.parse(alt) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(["project_images"]) };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteProjectImage(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("project_images")
      .delete()
      .eq("id", z.uuid().parse(id))
      .select("path")
      .single();
    if (error) throw error;
    await supabase.storage.from("media").remove([data.path]);
    return { ok: true, revalidated: await revalidateSite(["project_images"]) };
  } catch (error) {
    return failure(error);
  }
}
