"use server";

import { localizedText } from "@repo/content";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, failure } from "@/lib/result";
import { revalidateSite } from "@/lib/revalidate";

const TAGS = ["skill_groups", "skills"];

export async function createSkillGroup(): Promise<ActionResult<{ id: string; position: number }>> {
  try {
    const { supabase } = await requireAdmin();
    const { data: last } = await supabase
      .from("skill_groups")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.position ?? -1) + 1;
    const { data, error } = await supabase
      .from("skill_groups")
      .insert({ name: { tr: "", en: "" }, position })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(TAGS), data: { id: data.id, position } };
  } catch (error) {
    return failure(error);
  }
}

export async function renameSkillGroup(id: string, name: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("skill_groups")
      .update({ name: localizedText.parse(name) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(TAGS) };
  } catch (error) {
    return failure(error);
  }
}

export async function addSkill(
  groupId: string,
  name: string,
): Promise<ActionResult<{ id: string; position: number }>> {
  try {
    const { supabase } = await requireAdmin();
    const gid = z.uuid().parse(groupId);
    const skill = z.string().trim().min(1).max(60).parse(name);
    const { data: last } = await supabase
      .from("skills")
      .select("position")
      .eq("group_id", gid)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.position ?? -1) + 1;
    const { data, error } = await supabase
      .from("skills")
      .insert({ group_id: gid, name: skill, position })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, revalidated: await revalidateSite(TAGS), data: { id: data.id, position } };
  } catch (error) {
    return failure(error);
  }
}
