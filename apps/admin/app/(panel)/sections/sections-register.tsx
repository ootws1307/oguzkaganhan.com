"use client";

import type { SectionKey } from "@repo/content";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { reorderRows, setVisible } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Switch } from "@/components/ui/switch";

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Kapak (giriş)",
  about: "Hakkımda",
  projects: "Projeler",
  experience: "Deneyim ve eğitim",
  skills: "Yetenekler",
  contact: "İletişim",
};

type Row = { id: string; key: SectionKey; is_visible: boolean; title: string };

export function SectionsRegister({ sections }: { sections: Row[] }) {
  const [rows, setRows] = useState(sections);
  const [optimistic, setOptimistic] = useOptimistic(rows);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reorder(next: Row[]) {
    const previous = rows;
    setRows(next);
    startTransition(async () => {
      const result = await reorderRows(
        "sections",
        next.map((r) => r.id),
      );
      if (!result.ok) {
        setRows(previous);
        setError(result.error);
      } else setError(null);
    });
  }

  function toggle(row: Row, visible: boolean) {
    startTransition(async () => {
      setOptimistic(rows.map((r) => (r.id === row.id ? { ...r, is_visible: visible } : r)));
      const result = await setVisible("sections", row.id, visible);
      if (result.ok) {
        setRows((current) =>
          current.map((r) => (r.id === row.id ? { ...r, is_visible: visible } : r)),
        );
        setError(null);
      } else setError(result.error);
    });
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-signal">
          {error}
        </p>
      )}
      <SortableList
        id="sections"
        items={optimistic}
        onReorder={reorder}
        className="border-t border-ink"
        renderItem={(row, handle) => {
          const index = optimistic.findIndex((r) => r.id === row.id);
          return (
            <div className="flex items-center gap-2 border-b border-rule py-1.5 pr-2">
              {handle}
              <span className="caps w-8 text-sm text-ink-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Link
                href={`/sections/${row.key}`}
                className="group flex min-w-0 flex-1 items-baseline gap-3 py-2"
              >
                <span className="text-lg font-medium leading-snug group-hover:underline group-hover:decoration-signal">
                  {SECTION_LABELS[row.key]}
                </span>
                {row.title && <span className="truncate text-sm text-ink-soft">“{row.title}”</span>}
                <ChevronRight className="ml-auto size-4 shrink-0 text-ink-soft" aria-hidden />
              </Link>
              <label className="flex items-center gap-2 pl-3 text-sm text-ink-soft">
                <span className="sr-only sm:not-sr-only">
                  {row.is_visible ? "Görünür" : "Gizli"}
                </span>
                <Switch
                  checked={row.is_visible}
                  onCheckedChange={(checked) => toggle(row, checked)}
                  aria-label={`${SECTION_LABELS[row.key]} bölümünü göster`}
                />
              </label>
            </div>
          );
        }}
      />
      <p className="mt-4 text-sm text-ink-soft">
        Boş bölümler (ör. metni olmayan Hakkımda) görünür olsa bile sitede çizilmez.
      </p>
    </div>
  );
}
