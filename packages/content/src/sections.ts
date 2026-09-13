import { z } from "zod";
import { localized } from "./locale";

export const sectionKeys = [
  "hero",
  "about",
  "projects",
  "experience",
  "skills",
  "contact",
] as const;
export type SectionKey = (typeof sectionKeys)[number];

const text = (max = 200) => z.string().trim().max(max);
const markdown = z.string().max(20000);

/**
 * Every section type has its own localized `content` and non-localized `options`.
 * Admin forms and the public site both validate against these, so the database
 * `jsonb` columns never hold a shape the renderer doesn't understand.
 */
export const sectionSchemas = {
  hero: {
    content: localized(
      z.object({
        title: text(120),
        subtitle: text(240),
        body_md: markdown,
        status: text(80),
      }),
    ),
    // The photo and CV files themselves live in site_settings; sections only decide whether to show them.
    options: z.object({
      show_photo: z.boolean(),
      show_status: z.boolean(),
      show_cv: z.boolean(),
    }),
  },
  about: {
    content: localized(z.object({ title: text(), body_md: markdown })),
    options: z.object({ show_photo: z.boolean() }),
  },
  projects: {
    content: localized(z.object({ title: text(), intro: text(600) })),
    options: z.object({
      max_items: z.number().int().min(0).max(100),
      featured_only: z.boolean(),
      show_github_stats: z.boolean(),
    }),
  },
  experience: {
    content: localized(z.object({ title: text(), intro: text(600) })),
    options: z.object({ show_education: z.boolean() }),
  },
  skills: {
    content: localized(z.object({ title: text(), intro: text(600) })),
    options: z.object({}),
  },
  contact: {
    content: localized(z.object({ title: text(), body_md: markdown })),
    options: z.object({ show_email: z.boolean() }),
  },
} as const satisfies Record<SectionKey, { content: z.ZodType; options: z.ZodType }>;

export type SectionContent<K extends SectionKey> = z.infer<(typeof sectionSchemas)[K]["content"]>;
export type SectionOptions<K extends SectionKey> = z.infer<(typeof sectionSchemas)[K]["options"]>;

export type Section<K extends SectionKey = SectionKey> = {
  [P in K]: {
    id: string;
    key: P;
    position: number;
    is_visible: boolean;
    content: SectionContent<P>;
    options: SectionOptions<P>;
  };
}[K];

/** Validates a raw database row into a typed section, or returns null if it is malformed. */
export function parseSection(row: {
  id: string;
  key: string;
  position: number;
  is_visible: boolean;
  content: unknown;
  options: unknown;
}): Section | null {
  const key = row.key as SectionKey;
  const schema = sectionSchemas[key];
  if (!schema) return null;
  const content = schema.content.safeParse(row.content);
  const options = schema.options.safeParse(row.options);
  if (!content.success || !options.success) return null;
  return { ...row, key, content: content.data, options: options.data } as Section;
}
