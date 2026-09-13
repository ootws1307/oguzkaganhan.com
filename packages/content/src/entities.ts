import { z } from "zod";
import { localized, localizedText } from "./locale";

const optionalUrl = z.union([z.url(), z.literal("")]);
const isoDate = z.iso.date();

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and single dashes");

/** Admin form input for a project. GitHub projects may leave text fields empty to inherit repo data. */
export const projectInputSchema = z.object({
  slug: slugSchema,
  title: localizedText,
  summary: localizedText,
  body_md: localized(z.string().max(50000)),
  tech: z.array(z.string().trim().min(1).max(40)).max(30),
  repo_url: optionalUrl,
  live_url: optionalUrl,
  cover_path: z.string().nullable(),
  is_featured: z.boolean(),
  is_visible: z.boolean(),
  started_on: isoDate.nullable(),
  ended_on: isoDate.nullable(),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/** A screenshot on a project's detail page. */
export const projectImageInputSchema = z.object({
  project_id: z.uuid(),
  path: z.string().trim().min(1),
  alt: localizedText,
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});
export type ProjectImageInput = z.infer<typeof projectImageInputSchema>;

export const experienceKinds = ["work", "education"] as const;
export const experienceInputSchema = z
  .object({
    kind: z.enum(experienceKinds),
    organization: z.string().trim().min(1).max(120),
    role: localizedText,
    location: z.string().trim().max(120),
    url: optionalUrl,
    description_md: localized(z.string().max(20000)),
    started_on: isoDate,
    ended_on: isoDate.nullable(),
    is_visible: z.boolean(),
  })
  .refine((v) => !v.ended_on || v.ended_on >= v.started_on, {
    message: "End date must be after start date",
    path: ["ended_on"],
  });
export type ExperienceInput = z.infer<typeof experienceInputSchema>;

export const skillGroupInputSchema = z.object({
  name: localizedText,
  is_visible: z.boolean(),
});
export type SkillGroupInput = z.infer<typeof skillGroupInputSchema>;

export const skillInputSchema = z.object({
  group_id: z.uuid(),
  name: z.string().trim().min(1).max(60),
});
export type SkillInput = z.infer<typeof skillInputSchema>;

export const contactKinds = ["email", "github", "linkedin", "x", "website", "other"] as const;
export const contactLinkInputSchema = z.object({
  kind: z.enum(contactKinds),
  label: z.string().trim().min(1).max(60),
  url: z.string().trim().min(1).max(300),
  is_visible: z.boolean(),
});
export type ContactLinkInput = z.infer<typeof contactLinkInputSchema>;

export const siteSettingsInputSchema = z.object({
  site_name: z.string().trim().min(1).max(80),
  seo_title: localizedText,
  seo_description: localizedText,
  og_image_path: z.string().nullable(),
  avatar_path: z.string().nullable(),
  cv_paths: localized(z.string().nullable()),
  github_username: z
    .string()
    .trim()
    .regex(/^[a-z\d](?:[a-z\d-]{0,38})$/i, "Not a valid GitHub username"),
  auto_publish_new_repos: z.boolean(),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
