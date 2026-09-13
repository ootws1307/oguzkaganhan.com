import { type Localized, parseSection, type Section } from "@repo/content";
import type { Tables } from "./database.types";
import type { DbClient } from "./env";
import { type ProjectRow, type ProjectView, resolveProject } from "./projects";

// These read through whatever client they are given: with the public client they
// return only visible rows (RLS), with an admin session they return everything.

export async function getSiteSettings(client: DbClient) {
  const { data, error } = await client.from("site_settings").select("*").single();
  if (error) throw error;
  return data;
}

export async function getSections(client: DbClient): Promise<Section[]> {
  const { data, error } = await client.from("sections").select("*").order("position");
  if (error) throw error;
  return data.map(parseSection).filter((s): s is Section => s !== null);
}

const projectSelect = "*, github_repos(*)";

export async function getProjects(client: DbClient): Promise<ProjectView[]> {
  const { data, error } = await client.from("projects").select(projectSelect).order("position");
  if (error) throw error;
  return (data as ProjectRow[]).map(resolveProject);
}

export async function getProjectBySlug(
  client: DbClient,
  slug: string,
): Promise<ProjectView | null> {
  const { data, error } = await client
    .from("projects")
    .select(projectSelect)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? resolveProject(data as ProjectRow) : null;
}

export type Experience = Omit<Tables<"experiences">, "role" | "description_md"> & {
  role: Localized<string>;
  description_md: Localized<string>;
};

export async function getExperiences(client: DbClient): Promise<Experience[]> {
  const { data, error } = await client.from("experiences").select("*").order("position");
  if (error) throw error;
  return data as Experience[];
}

export type SkillGroup = Omit<Tables<"skill_groups">, "name"> & {
  name: Localized<string>;
  skills: Tables<"skills">[];
};

export async function getSkillGroups(client: DbClient): Promise<SkillGroup[]> {
  const { data, error } = await client
    .from("skill_groups")
    .select("*, skills(*)")
    .order("position")
    .order("position", { referencedTable: "skills" });
  if (error) throw error;
  return data as SkillGroup[];
}

export async function getContactLinks(client: DbClient) {
  const { data, error } = await client.from("contact_links").select("*").order("position");
  if (error) throw error;
  return data;
}
