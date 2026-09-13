"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Localized, localized, slugSchema } from "@repo/content";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { LocalizedColumns } from "@/components/localized-columns";
import { MarkdownField } from "@/components/markdown-field";
import { SaveBar, type SaveStatus } from "@/components/save-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MediaField } from "@/components/upload";
import { deleteProject, saveProject } from "./actions";

const urlOrEmpty = z.union([z.url("Geçerli bir adres gir (https://…)"), z.literal("")]);
const dateOrEmpty = z.union([z.iso.date(), z.literal("")]);

const formSchema = z
  .object({
    slug: slugSchema,
    title: localized(z.string().trim().max(200)),
    summary: localized(z.string().trim().max(600)),
    body_md: localized(z.string().max(50000)),
    tech: z.string().max(1000),
    repo_url: urlOrEmpty,
    live_url: urlOrEmpty,
    cover_path: z.string().nullable(),
    is_featured: z.boolean(),
    is_visible: z.boolean(),
    started_on: dateOrEmpty,
    ended_on: dateOrEmpty,
  })
  .refine((v) => !v.started_on || !v.ended_on || v.ended_on >= v.started_on, {
    message: "Bitiş tarihi başlangıçtan önce olamaz.",
    path: ["ended_on"],
  });

export type ProjectFormValues = z.infer<typeof formSchema>;

type RepoInfo = {
  name: string;
  description: string | null;
  hasReadme: boolean;
  html_url: string;
  homepage: string | null;
  tech: string[];
};

function toInput(values: ProjectFormValues) {
  return {
    ...values,
    tech: values.tech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    started_on: values.started_on || null,
    ended_on: values.ended_on || null,
  };
}

export function ProjectForm({
  id,
  repo,
  initial,
  children,
}: {
  id: string | null;
  repo: RepoInfo | null;
  initial: ProjectFormValues;
  children?: ReactNode;
}) {
  const router = useRouter();
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial,
  });
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [deleting, startDelete] = useTransition();
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await saveProject(id, toInput(values));
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    form.reset(values);
    setStatus({ kind: "saved", revalidated: result.revalidated });
    if (!id && result.data) router.replace(`/projects/${result.data.id}`);
    else router.refresh();
  });

  const localeError = (field: "title" | "summary" | "body_md", locale: "tr" | "en") =>
    (errors[field] as Partial<Record<string, { message?: string }>> | undefined)?.[locale];

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-12 px-5 py-6 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
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
                <span className="caps" aria-hidden>
                  Sitede göster
                </span>
              </label>
            )}
          />
          <Controller
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <label className="flex items-center gap-3 border border-ink px-4 py-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Öne çıkar"
                />
                <span className="caps" aria-hidden>
                  Öne çıkar
                </span>
              </label>
            )}
          />
        </div>

        <section aria-labelledby="text-title" className="space-y-6">
          <h2 id="text-title" className="text-lg font-semibold">
            Metin
          </h2>
          <LocalizedColumns
            missing={{
              tr: !form.watch("title.tr") && !repo,
              en: !form.watch("title.en") && !repo,
            }}
          >
            {(locale) => (
              <>
                <Field data-invalid={!!localeError("title", locale) || undefined}>
                  <FieldLabel htmlFor={`title-${locale}`}>Başlık</FieldLabel>
                  <Input
                    id={`title-${locale}`}
                    placeholder={repo ? repo.name : undefined}
                    aria-invalid={!!localeError("title", locale) || undefined}
                    {...form.register(`title.${locale}`)}
                  />
                  <FieldError errors={[localeError("title", locale)]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`summary-${locale}`}>Kısa açıklama</FieldLabel>
                  <Input
                    id={`summary-${locale}`}
                    placeholder={repo?.description ?? undefined}
                    {...form.register(`summary.${locale}`)}
                  />
                  <FieldDescription>Listede ve kapakta görünen tek cümle.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`body-${locale}`}>Proje sayfası metni</FieldLabel>
                  <Controller
                    control={form.control}
                    name={`body_md.${locale}`}
                    render={({ field }) => (
                      <MarkdownField
                        id={`body-${locale}`}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        rows={14}
                        placeholder={
                          repo?.hasReadme ? "Boş bırakırsan repodaki README gösterilir." : undefined
                        }
                      />
                    )}
                  />
                  {repo?.hasReadme && (
                    <FieldDescription>
                      Boş bırakırsan GitHub'daki README.md gösterilir.
                    </FieldDescription>
                  )}
                </Field>
              </>
            )}
          </LocalizedColumns>
        </section>

        <section aria-labelledby="meta-title" className="max-w-3xl space-y-6">
          <h2 id="meta-title" className="text-lg font-semibold">
            Bilgiler
          </h2>
          <Field data-invalid={!!errors.slug || undefined}>
            <FieldLabel htmlFor="slug">Adres (slug)</FieldLabel>
            <Input
              id="slug"
              className="font-mono"
              aria-invalid={!!errors.slug || undefined}
              {...form.register("slug")}
            />
            <FieldDescription>Sayfa adresi: /projects/{form.watch("slug") || "…"}</FieldDescription>
            <FieldError errors={[errors.slug]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="tech">Kullanılanlar</FieldLabel>
            <Input id="tech" placeholder={repo?.tech.join(", ")} {...form.register("tech")} />
            <FieldDescription>
              Virgülle ayır. Boşsa repo dili ve konuları kullanılır.
            </FieldDescription>
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={!!errors.repo_url || undefined}>
              <FieldLabel htmlFor="repo_url">Kaynak kod adresi</FieldLabel>
              <Input
                id="repo_url"
                placeholder={repo?.html_url}
                aria-invalid={!!errors.repo_url || undefined}
                {...form.register("repo_url")}
              />
              <FieldError errors={[errors.repo_url]} />
            </Field>
            <Field data-invalid={!!errors.live_url || undefined}>
              <FieldLabel htmlFor="live_url">Canlı adres</FieldLabel>
              <Input
                id="live_url"
                placeholder={repo?.homepage ?? "https://"}
                aria-invalid={!!errors.live_url || undefined}
                {...form.register("live_url")}
              />
              <FieldError errors={[errors.live_url]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="started_on">Başlangıç</FieldLabel>
              <Input id="started_on" type="date" className="" {...form.register("started_on")} />
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
          </div>
          <Field>
            <FieldLabel>Kapak görseli</FieldLabel>
            <Controller
              control={form.control}
              name="cover_path"
              render={({ field }) => (
                <MediaField
                  value={field.value}
                  onChange={field.onChange}
                  folder="projects/covers"
                  kind="image"
                  label="Kapak görseli yükle"
                  hint="Kapak paftasında ve paylaşım önizlemesinde kullanılır."
                />
              )}
            />
          </Field>
        </section>

        {children}

        {id && !repo && (
          <section className="max-w-3xl border-t border-rule pt-6">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button type="button" variant="destructive" disabled={deleting}>
                    Projeyi sil
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Proje silinsin mi?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Proje ve ekran görüntüleri kalıcı olarak silinir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      startDelete(async () => {
                        const result = await deleteProject(id);
                        if (result.ok) router.replace("/projects");
                        else setStatus({ kind: "error", message: result.error });
                      })
                    }
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        )}
      </div>

      <SaveBar
        dirty={form.formState.isDirty}
        saving={form.formState.isSubmitting}
        status={status}
        submitLabel={id ? "Kaydet" : "Projeyi oluştur"}
        onReset={() => {
          form.reset();
          setStatus({ kind: "idle" });
        }}
      />
    </form>
  );
}

export type { Localized };
