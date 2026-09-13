"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { localized } from "@repo/content";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { deleteRow } from "@/app/(panel)/actions";
import { LocalizedColumns } from "@/components/localized-columns";
import { MarkdownField } from "@/components/markdown-field";
import { SaveBar, type SaveStatus } from "@/components/save-bar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveExperience } from "./actions";

const formSchema = z
  .object({
    kind: z.enum(["work", "education"]),
    organization: z.string().trim().min(1, "Kurum adı gerekli.").max(120),
    role: localized(z.string().trim().max(200)),
    location: z.string().trim().max(120),
    url: z.union([z.url("Geçerli bir adres gir (https://…)"), z.literal("")]),
    description_md: localized(z.string().max(20000)),
    started_on: z.iso.date("Başlangıç tarihi gerekli."),
    ended_on: z.union([z.iso.date(), z.literal("")]),
    is_visible: z.boolean(),
  })
  .refine((v) => !v.ended_on || v.ended_on >= v.started_on, {
    message: "Bitiş tarihi başlangıçtan önce olamaz.",
    path: ["ended_on"],
  });

export type ExperienceFormValues = z.infer<typeof formSchema>;

const KINDS = [
  { value: "work", label: "Deneyim (iş, staj)" },
  { value: "education", label: "Eğitim" },
] as const;

export function ExperienceForm({
  id,
  initial,
}: {
  id: string | null;
  initial: ExperienceFormValues;
}) {
  const router = useRouter();
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial,
  });
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [deleting, startDelete] = useTransition();
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await saveExperience(id, { ...values, ended_on: values.ended_on || null });
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    form.reset(values);
    setStatus({ kind: "saved", revalidated: result.revalidated });
    if (!id && result.data) router.replace(`/experience/${result.data.id}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-12 px-5 py-6 sm:px-8">
        <div className="max-w-3xl space-y-6">
          <Controller
            control={form.control}
            name="kind"
            render={({ field }) => (
              <fieldset>
                <legend className="caps mb-2 text-sm">Tür</legend>
                <div className="inline-flex border border-ink">
                  {KINDS.map((k) => (
                    <label
                      key={k.value}
                      className={`cursor-pointer px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                        field.value === k.value ? "bg-ink text-paper" : "hover:bg-paper-deep"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={field.name}
                        value={k.value}
                        checked={field.value === k.value}
                        onChange={() => field.onChange(k.value)}
                      />
                      {k.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={!!errors.organization || undefined}>
              <FieldLabel htmlFor="organization">Kurum</FieldLabel>
              <Input
                id="organization"
                aria-invalid={!!errors.organization || undefined}
                {...form.register("organization")}
              />
              <FieldError errors={[errors.organization]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="location">Konum</FieldLabel>
              <Input
                id="location"
                placeholder="İstanbul / Uzaktan"
                {...form.register("location")}
              />
            </Field>
            <Field data-invalid={!!errors.started_on || undefined}>
              <FieldLabel htmlFor="started_on">Başlangıç</FieldLabel>
              <Input
                id="started_on"
                type="date"
                className=""
                aria-invalid={!!errors.started_on || undefined}
                {...form.register("started_on")}
              />
              <FieldError errors={[errors.started_on]} />
            </Field>
            <Field data-invalid={!!errors.ended_on || undefined}>
              <FieldLabel htmlFor="ended_on">Bitiş</FieldLabel>
              <Input
                id="ended_on"
                type="date"
                className=""
                aria-invalid={!!errors.ended_on || undefined}
                {...form.register("ended_on")}
              />
              <FieldDescription>Boşsa "devam ediyor".</FieldDescription>
              <FieldError errors={[errors.ended_on]} />
            </Field>
            <Field data-invalid={!!errors.url || undefined} className="sm:col-span-2">
              <FieldLabel htmlFor="url">Kurum adresi</FieldLabel>
              <Input
                id="url"
                placeholder="https://"
                aria-invalid={!!errors.url || undefined}
                {...form.register("url")}
              />
              <FieldError errors={[errors.url]} />
            </Field>
          </div>
          <Controller
            control={form.control}
            name="is_visible"
            render={({ field }) => (
              <label className="flex items-center gap-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Sitede göster"
                />
                <span aria-hidden>Sitede göster</span>
              </label>
            )}
          />
        </div>

        <LocalizedColumns missing={{ tr: !form.watch("role.tr"), en: !form.watch("role.en") }}>
          {(locale) => (
            <>
              <Field>
                <FieldLabel htmlFor={`role-${locale}`}>
                  {form.watch("kind") === "education" ? "Bölüm / program" : "Rol"}
                </FieldLabel>
                <Input id={`role-${locale}`} {...form.register(`role.${locale}`)} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`desc-${locale}`}>Açıklama</FieldLabel>
                <Controller
                  control={form.control}
                  name={`description_md.${locale}`}
                  render={({ field }) => (
                    <MarkdownField
                      id={`desc-${locale}`}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      rows={6}
                    />
                  )}
                />
              </Field>
            </>
          )}
        </LocalizedColumns>

        {id && (
          <div className="border-t border-rule pt-6">
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                if (!window.confirm("Bu kayıt silinsin mi?")) return;
                startDelete(async () => {
                  const result = await deleteRow("experiences", id);
                  if (result.ok) router.replace("/experience");
                  else setStatus({ kind: "error", message: result.error });
                });
              }}
            >
              Kaydı sil
            </Button>
          </div>
        )}
      </div>

      <SaveBar
        dirty={form.formState.isDirty}
        saving={form.formState.isSubmitting}
        status={status}
        submitLabel={id ? "Kaydet" : "Kaydı oluştur"}
        onReset={() => {
          form.reset();
          setStatus({ kind: "idle" });
        }}
      />
    </form>
  );
}
