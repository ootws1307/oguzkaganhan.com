"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saved"; revalidated: boolean }
  | { kind: "error"; message: string };

/**
 * Sticky bar that appears with unsaved changes or after a save. Also guards
 * against leaving the page with unsaved edits.
 */
export function SaveBar({
  dirty,
  saving,
  status,
  onReset,
  submitLabel = "Kaydet",
}: {
  dirty: boolean;
  saving: boolean;
  status: SaveStatus;
  onReset: () => void;
  submitLabel?: string;
}) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!dirty && status.kind === "idle") return null;

  let message: { text: string; tone: "redline" | "soft" };
  if (status.kind === "error") message = { text: status.message, tone: "redline" };
  else if (dirty) message = { text: "Kaydedilmemiş değişiklikler var.", tone: "redline" };
  else if (status.kind === "saved" && status.revalidated)
    message = { text: "Kaydedildi. Site güncellendi.", tone: "soft" };
  else
    message = {
      text: "Kaydedildi, ama site şu an güncellenemedi (web uygulaması çalışmıyor olabilir).",
      tone: "soft",
    };

  return (
    <div className="sticky bottom-0 z-20 mt-10 border-t border-ink bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`text-sm ${message.tone === "redline" ? "text-redline" : "text-ink-soft"}`}
        >
          {message.text}
        </p>
        {dirty && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onReset} disabled={saving}>
              Geri al
            </Button>
            <Button type="submit" disabled={saving} className="caps px-4">
              {saving ? "Kaydediliyor…" : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
