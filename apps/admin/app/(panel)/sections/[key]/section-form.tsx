"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Locale, locales, type SectionKey, sectionSchemas } from "@repo/content";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { LocalizedColumns } from "@/components/localized-columns";
import { MarkdownField } from "@/components/markdown-field";
import { SaveBar, type SaveStatus } from "@/components/save-bar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveSection } from "./actions";

type TextField = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "markdown";
  hint?: string;
};
type OptionField = { name: string; label: string; kind: "switch" | "number"; hint?: string };

const CONTENT_FIELDS: Record<SectionKey, TextField[]> = {
  hero: [
    { name: "title", label: "İsim / başlık", kind: "text", hint: "Kapaktaki büyük başlık." },
    {
      name: "subtitle",
      label: "Rol",
      kind: "text",
      hint: "Ör. Bilgisayar mühendisliği öğrencisi.",
    },
    { name: "body_md", label: "Kısa tanıtım", kind: "markdown" },
    {
      name: "status",
      label: "Durum notu",
      kind: "text",
      hint: "Ör. Staj için müsait. Antette kırmızıyla görünür.",
    },
  ],
  about: [
    { name: "title", label: "Başlık", kind: "text" },
    { name: "body_md", label: "Metin", kind: "markdown" },
  ],
  projects: [
    { name: "title", label: "Başlık", kind: "text" },
    { name: "intro", label: "Giriş cümlesi", kind: "textarea" },
  ],
  experience: [
    { name: "title", label: "Başlık", kind: "text" },
    { name: "intro", label: "Giriş cümlesi", kind: "textarea" },
  ],
  skills: [
    { name: "title", label: "Başlık", kind: "text" },
    { name: "intro", label: "Giriş cümlesi", kind: "textarea" },
  ],
  contact: [
    { name: "title", label: "Başlık", kind: "text" },
    { name: "body_md", label: "Metin", kind: "markdown" },
  ],
};

const OPTION_FIELDS: Record<SectionKey, OptionField[]> = {
  hero: [
    {
      name: "show_photo",
      label: "Profil fotoğrafını antette göster",
      kind: "switch",
      hint: "Fotoğraf Site ayarlarından yüklenir.",
    },
    { name: "show_status", label: "Durum notunu göster", kind: "switch" },
    {
      name: "show_cv",
      label: "CV indirme butonunu göster",
      kind: "switch",
      hint: "CV yoksa yerine ilk iletişim bağlantısı çıkar.",
    },
  ],
  about: [{ name: "show_photo", label: "Profil fotoğrafını göster", kind: "switch" }],
  projects: [
    { name: "max_items", label: "En fazla kaç proje", kind: "number", hint: "0 = hepsi." },
    { name: "featured_only", label: "Sadece öne çıkanları listele", kind: "switch" },
    { name: "show_github_stats", label: "GitHub yıldızlarını göster", kind: "switch" },
  ],
  experience: [{ name: "show_education", label: "Eğitimi de göster", kind: "switch" }],
  skills: [],
  contact: [{ name: "show_email", label: "E-posta bağlantılarını göster", kind: "switch" }],
};

type Values = {
  content: Record<Locale, Record<string, string>>;
  options: Record<string, boolean | number>;
  is_visible: boolean;
};

export function SectionForm({ sectionKey, initial }: { sectionKey: SectionKey; initial: Values }) {
  const schema = useMemo(
    () =>
      z.object({
        content: sectionSchemas[sectionKey].content,
        options: sectionSchemas[sectionKey].options,
        is_visible: z.boolean(),
      }) as unknown as z.ZodType<Values, Values>,
    [sectionKey],
  );
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const content = useWatch({ control: form.control, name: "content" });

  const missing = Object.fromEntries(
    locales.map((l) => [l, Object.values(content?.[l] ?? {}).every((v) => !String(v).trim())]),
  ) as Record<Locale, boolean>;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await saveSection(sectionKey, values);
    if (result.ok) {
      form.reset(values);
      setStatus({ kind: "saved", revalidated: result.revalidated });
    } else setStatus({ kind: "error", message: result.error });
  });

  const fields = CONTENT_FIELDS[sectionKey];
  const options = OPTION_FIELDS[sectionKey];
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-10 px-5 py-6 sm:px-8">
        <Controller
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <label className="flex items-center gap-3 border border-ink px-4 py-3">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="Sitede göster"
              />
              <span>
                <span className="caps block" aria-hidden>
                  Sitede göster
                </span>
                <span className="text-sm text-ink-soft">
                  Kapalıyken bölüm ve dizindeki satırı gizlenir.
                </span>
              </span>
            </label>
          )}
        />

        <section aria-labelledby="content-title">
          <h2 id="content-title" className="mb-5 text-lg font-semibold">
            İçerik
          </h2>
          <LocalizedColumns missing={missing}>
            {(locale) =>
              fields.map((f) => {
                const id = `${locale}-${f.name}`;
                const name = `content.${locale}.${f.name}` as const;
                const error = (
                  errors.content?.[locale] as Record<string, { message?: string }> | undefined
                )?.[f.name];
                return (
                  <Field key={id} data-invalid={!!error || undefined}>
                    <FieldLabel htmlFor={id}>{f.label}</FieldLabel>
                    {f.kind === "markdown" ? (
                      <Controller
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <MarkdownField
                            id={id}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            invalid={!!error}
                          />
                        )}
                      />
                    ) : f.kind === "textarea" ? (
                      <Textarea
                        id={id}
                        rows={3}
                        aria-invalid={!!error || undefined}
                        {...form.register(name)}
                      />
                    ) : (
                      <Input id={id} aria-invalid={!!error || undefined} {...form.register(name)} />
                    )}
                    {f.hint && <FieldDescription>{f.hint}</FieldDescription>}
                    <FieldError errors={[error]} />
                  </Field>
                );
              })
            }
          </LocalizedColumns>
        </section>

        {options.length > 0 && (
          <section aria-labelledby="options-title">
            <h2 id="options-title" className="mb-5 text-lg font-semibold">
              Ayarlar
            </h2>
            <div className="max-w-2xl border-t border-ink">
              {options.map((o) => {
                const id = `option-${o.name}`;
                return (
                  <div
                    key={o.name}
                    className="flex items-center justify-between gap-6 border-b border-rule py-3"
                  >
                    <div>
                      <label htmlFor={id} className="block">
                        {o.label}
                      </label>
                      {o.hint && <p className="text-sm text-ink-soft">{o.hint}</p>}
                    </div>
                    {o.kind === "switch" ? (
                      <Controller
                        control={form.control}
                        name={`options.${o.name}`}
                        render={({ field }) => (
                          <Switch
                            id={id}
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    ) : (
                      <Input
                        id={id}
                        type="number"
                        min={0}
                        max={100}
                        className="w-24"
                        {...form.register(`options.${o.name}`, { valueAsNumber: true })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <SaveBar
        dirty={form.formState.isDirty}
        saving={form.formState.isSubmitting}
        status={status}
        onReset={() => {
          form.reset();
          setStatus({ kind: "idle" });
        }}
      />
    </form>
  );
}
