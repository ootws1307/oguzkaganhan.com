import type { Localized } from "@repo/content";
import type { Tables } from "./database.types";
import type { DbClient } from "./env";

export type ProjectImage = Omit<Tables<"project_images">, "alt"> & { alt: Localized<string> };

export async function getProjectImages(
  client: DbClient,
  projectId: string,
): Promise<ProjectImage[]> {
  const { data, error } = await client
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("position");
  if (error) throw error;
  return data as ProjectImage[];
}
