"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SiteSettingsInput, siteSettingsInputSchema } from "@repo/content";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LocalizedColumns } from "@/components/localized-columns";
import { SaveBar, type SaveStatus } from "@/components/save-bar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaField } from "@/components/upload";
import { saveSettings } from "./actions";

export function SettingsForm({ initial }: { initial: SiteSettingsInput }) {
  const form = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsInputSchema),
    defaultValues: initial,
  });
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await saveSettings(values);
    if (result.ok) {
      form.reset(values);
      setStatus({ kind: "saved", revalidated: result.revalidated });
    } else setStatus({ kind: "error", message: result.error });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-12 px-5 py-6 sm:px-8">
        <section aria-labelledby="identity-title" className="max-w-3xl space-y-6">
          <h2 id="identity-title" className="text-lg font-semibold">
            Kimlik
          </h2>
          <Field data-invalid={!!errors.site_name || undefined}>
            <FieldLabel htmlFor="site_name">İsim</FieldLabel>
            <Input
              id="site_name"
              aria-invalid={!!errors.site_name || undefined}
              {...form.register("site_name")}
            />
            <FieldDescription>
              Dizin şeridinde ve antetin "Çizen" satırında görünür.
            </FieldDescription>
            <FieldError errors={[errors.site_name]} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel>Profil fotoğrafı</FieldLabel>
              <Controller
                control={form.control}
                name="avatar_path"
                render={({ field }) => (
                  <MediaField
                    value={field.value}
                    onChange={field.onChange}
                    folder="site"
                    kind="image"
                    label="Fotoğraf yükle"
                    hint="Sitede mürekkep tonunda basılır."
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Paylaşım görseli</FieldLabel>
              <Controller
                control={form.control}
                name="og_image_path"
                render={({ field }) => (
                  <MediaField
                    value={field.value}
                    onChange={field.onChange}
                    folder="site"
                    kind="image"
                    label="Görsel yükle"
                    hint="Link paylaşıldığında çıkan önizleme (1200×630)."
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="cv-title" className="max-w-3xl space-y-6">
          <h2 id="cv-title" className="text-lg font-semibold">
            CV
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {(["tr", "en"] as const).map((locale) => (
              <Field key={locale}>
                <FieldLabel>{locale === "tr" ? "Türkçe CV" : "English CV"}</FieldLabel>
                <Controller
                  control={form.control}
                  name={`cv_paths.${locale}`}
                  render={({ field }) => (
                    <MediaField
                      value={field.value}
                      onChange={field.onChange}
                      folder="cv"
                      kind="pdf"
                      label="PDF yükle"
                      hint="Yalnızca biri varsa iki dilde de o sunulur."
                    />
                  )}
                />
              </Field>
            ))}
          </div>
        </section>

        <section aria-labelledby="seo-title" className="space-y-6">
          <h2 id="seo-title" className="text-lg font-semibold">
            Arama motorları
          </h2>
          <LocalizedColumns
            missing={{ tr: !form.watch("seo_title.tr"), en: !form.watch("seo_title.en") }}
          >
            {(locale) => (
              <>
                <Field>
                  <FieldLabel htmlFor={`seo-title-${locale}`}>Sayfa başlığı</FieldLabel>
                  <Input id={`seo-title-${locale}`} {...form.register(`seo_title.${locale}`)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`seo-desc-${locale}`}>Açıklama</FieldLabel>
                  <Textarea
                    id={`seo-desc-${locale}`}
                    rows={3}
                    {...form.register(`seo_description.${locale}`)}
                  />
                  <FieldDescription>Arama sonuçlarında görünen 1–2 cümle.</FieldDescription>
                </Field>
              </>
            )}
          </LocalizedColumns>
        </section>

        <section aria-labelledby="github-title" className="max-w-3xl space-y-6">
          <h2 id="github-title" className="text-lg font-semibold">
            GitHub
          </h2>
          <Field data-invalid={!!errors.github_username || undefined}>
            <FieldLabel htmlFor="github_username">Kullanıcı adı</FieldLabel>
            <Input
              id="github_username"
              className="font-mono"
              aria-invalid={!!errors.github_username || undefined}
              {...form.register("github_username")}
            />
            <FieldDescription>
              Bu hesabın public repoları 6 saatte bir senkronize edilir.
            </FieldDescription>
            <FieldError errors={[errors.github_username]} />
          </Field>
          <Controller
            control={form.control}
            name="auto_publish_new_repos"
            render={({ field }) => (
              <label className="flex items-start gap-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                  aria-label="Yeni repoları otomatik yayınla"
                />
                <span>
                  <span className="block" aria-hidden>
                    Yeni repoları otomatik yayınla
                  </span>
                  <span className="text-sm text-ink-soft">
                    Kapalıyken yeni repolar Projeler'de gizli bekler. Fork ve arşivlenmiş repolar
                    her zaman gizli gelir.
                  </span>
                </span>
              </label>
            )}
          />
        </section>
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
