"use client";

import { mediaUrl } from "@repo/db";
import { createClient } from "@repo/db/browser";
import { FileText, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

export type Uploaded = { path: string; width: number | null; height: number | null };

function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return Promise.resolve({ width: null, height: null });
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ width: null, height: null });
    img.src = url;
  });
}

/** Uploads straight from the browser to the `media` bucket as the signed-in admin (RLS). */
export async function uploadToMedia(file: File, folder: string): Promise<Uploaded> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const size = await imageSize(file);
  const { error } = await createClient()
    .storage.from("media")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return { path, ...size };
}

/** A drop zone that also works as a plain button (keyboard, click). */
export function DropZone({
  accept,
  multiple,
  label,
  hint,
  busy,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  busy?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [over, setOver] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drop target only; the labelled file input inside is the keyboard/click path
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = [...e.dataTransfer.files];
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`border border-dashed px-4 py-5 transition-colors ${
        over ? "border-ink bg-paper-deep" : "border-ink-soft"
      }`}
    >
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <Upload className="size-4 shrink-0" aria-hidden />
        <span>
          <span className="caps block text-sm">{busy ? "Yükleniyor…" : label}</span>
          {hint && <span className="text-sm text-ink-soft">{hint}</span>}
        </span>
      </label>
    </div>
  );
}

/** A single stored file (image or PDF) with replace and remove. Holds only the storage path. */
export function MediaField({
  value,
  onChange,
  folder,
  kind,
  label,
  hint,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  folder: string;
  kind: "image" | "pdf";
  label: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: File[]) {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { path } = await uploadToMedia(file, folder);
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-4 border border-ink p-3">
          {kind === "image" ? (
            // biome-ignore lint/performance/noImgElement: admin preview of an arbitrary uploaded file
            <img src={mediaUrl(value)} alt="" className="size-20 border border-rule object-cover" />
          ) : (
            <FileText className="size-8 shrink-0" aria-hidden />
          )}
          <a
            href={mediaUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-sm underline decoration-ink-faint"
          >
            {value.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex size-8 items-center justify-center text-ink-soft hover:text-redline"
            aria-label={`${label}: kaldır`}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
      <DropZone
        accept={kind === "image" ? "image/png,image/jpeg,image/webp,image/avif" : "application/pdf"}
        label={value ? "Değiştir" : label}
        hint={hint}
        busy={busy}
        onFiles={handle}
      />
      {error && (
        <p role="alert" className="text-sm text-redline">
          {error}
        </p>
      )}
    </div>
  );
}
