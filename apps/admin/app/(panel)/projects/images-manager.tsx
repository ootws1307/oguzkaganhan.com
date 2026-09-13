"use client";

import type { Localized } from "@repo/content";
import { mediaUrl, type ProjectImage } from "@repo/db";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { reorderRows } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Input } from "@/components/ui/input";
import { DropZone, uploadToMedia } from "@/components/upload";
import { addProjectImage, deleteProjectImage, updateProjectImageAlt } from "./actions";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Detail views (screenshots) shown on the project's page, in this order. */
export function ImagesManager({
  projectId,
  initial,
}: {
  projectId: string;
  initial: ProjectImage[];
}) {
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function upload(files: File[]) {
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        const uploaded = await uploadToMedia(file, `projects/${projectId}`);
        const result = await addProjectImage(projectId, uploaded);
        if (!result.ok) throw new Error(result.error);
        setImages((current) => [
          ...current,
          {
            id: result.data?.id as string,
            project_id: projectId,
            path: uploaded.path,
            width: uploaded.width,
            height: uploaded.height,
            alt: { tr: "", en: "" },
            position: result.data?.position ?? current.length,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  function saveAlt(image: ProjectImage, alt: Localized<string>) {
    setImages((current) => current.map((i) => (i.id === image.id ? { ...i, alt } : i)));
    startTransition(async () => {
      const result = await updateProjectImageAlt(image.id, alt);
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <section aria-labelledby="images-title" className="max-w-4xl space-y-5">
      <div>
        <h2 id="images-title" className="caps text-xl">
          Ekran görüntüleri
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Proje sayfasında "Detay A, B…" olarak bu sırayla görünür. Değişiklikler anında kaydedilir.
        </p>
      </div>

      {images.length > 0 && (
        <SortableList
          id="project-images"
          items={images}
          className="border-t border-ink"
          onReorder={(next) => {
            const previous = images;
            setImages(next);
            startTransition(async () => {
              const result = await reorderRows(
                "project_images",
                next.map((i) => i.id),
              );
              if (!result.ok) {
                setImages(previous);
                setError(result.error);
              }
            });
          }}
          renderItem={(image, handle) => {
            const index = images.findIndex((i) => i.id === image.id);
            return (
              <div className="flex items-start gap-3 border-b border-rule py-3 pr-1">
                <div className="pt-6">{handle}</div>
                <figure className="w-36 shrink-0">
                  {/* biome-ignore lint/performance/noImgElement: admin thumbnail of an uploaded file */}
                  <img
                    src={mediaUrl(image.path)}
                    alt=""
                    className="aspect-[16/10] w-full border border-ink bg-paper-deep object-contain"
                  />
                  <figcaption className="caps mt-1 text-xs text-ink-soft">
                    Detay {LETTERS[index % LETTERS.length]}
                  </figcaption>
                </figure>
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  {(["tr", "en"] as const).map((locale) => (
                    <label key={locale} className="block text-sm" lang={locale}>
                      <span className="caps text-xs text-ink-soft">
                        Açıklama ({locale.toUpperCase()})
                      </span>
                      <Input
                        defaultValue={image.alt[locale]}
                        placeholder={
                          locale === "tr" ? "Ekranda ne görünüyor?" : "What does it show?"
                        }
                        onBlur={(e) => {
                          if (e.target.value !== image.alt[locale]) {
                            saveAlt(image, { ...image.alt, [locale]: e.target.value });
                          }
                        }}
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label={`Detay ${LETTERS[index % LETTERS.length]}: sil`}
                  onClick={() => {
                    const previous = images;
                    setImages((current) => current.filter((i) => i.id !== image.id));
                    startTransition(async () => {
                      const result = await deleteProjectImage(image.id);
                      if (!result.ok) {
                        setImages(previous);
                        setError(result.error);
                      }
                    });
                  }}
                  className="mt-5 flex size-9 shrink-0 items-center justify-center text-ink-soft hover:text-redline"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            );
          }}
        />
      )}

      <DropZone
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        busy={busy}
        label="Ekran görüntüsü ekle"
        hint="Sürükle bırak ya da seç. PNG, JPG, WebP, AVIF; en fazla 10 MB."
        onFiles={upload}
      />
      {error && (
        <p role="alert" className="text-sm text-redline">
          {error}
        </p>
      )}
    </section>
  );
}
