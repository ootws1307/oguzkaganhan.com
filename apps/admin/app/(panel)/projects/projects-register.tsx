"use client";

import { ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderRows, setVisible } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Switch } from "@/components/ui/switch";
import { setFeatured } from "./actions";

type Row = {
  id: string;
  title: string;
  titleLang?: "en";
  source: "github" | "custom";
  is_visible: boolean;
  is_featured: boolean;
  repo: { full_name: string; is_fork: boolean; removed: boolean } | null;
};

const FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "visible", label: "Sitede" },
  { id: "hidden", label: "Gizli" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

export function ProjectsRegister({ projects }: { projects: Row[] }) {
  const [rows, setRows] = useState(projects);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const shown =
    filter === "all"
      ? rows
      : rows.filter((r) => (filter === "visible" ? r.is_visible : !r.is_visible));
  const hiddenCount = rows.filter((r) => !r.is_visible).length;

  function update(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>, undo: () => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        undo();
        setError(result.error ?? "Kaydedilemedi.");
      } else setError(null);
    });
  }

  function reorder(next: Row[]) {
    const previous = rows;
    setRows(next);
    run(
      () =>
        reorderRows(
          "projects",
          next.map((r) => r.id),
        ),
      () => setRows(previous),
    );
  }

  return (
    <div>
      <div role="tablist" aria-label="Filtre" className="mb-4 flex border-b border-rule">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`caps -mb-px border-b px-3 py-2 text-sm transition-colors ${
              filter === f.id
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {f.label}
            {f.id === "hidden" && hiddenCount > 0 && <span className="ml-1.5">{hiddenCount}</span>}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-signal">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="border-y border-ink py-6 text-ink-soft">
          {filter === "hidden"
            ? "Gizli proje yok."
            : "Henüz proje yok. GitHub senkronizasyonunu çalıştır ya da yeni bir proje ekle."}
        </p>
      ) : (
        <SortableList
          id="projects"
          items={shown}
          onReorder={
            filter === "all" ? reorder : () => setError("Sıralamak için 'Tümü' görünümüne geç.")
          }
          className="border-t border-ink"
          renderItem={(row, handle) => (
            <div className="flex items-center gap-2 border-b border-rule py-1.5 pr-2">
              {handle}
              <Link
                href={`/projects/${row.id}`}
                className="group flex min-w-0 flex-1 flex-col py-1.5"
              >
                <span className="flex items-baseline gap-3">
                  <span
                    lang={row.titleLang}
                    className="truncate text-lg font-medium leading-snug group-hover:underline group-hover:decoration-signal"
                  >
                    {row.title}
                  </span>
                  <ChevronRight
                    className="ml-auto size-4 shrink-0 self-center text-ink-soft"
                    aria-hidden
                  />
                </span>
                <span className="flex flex-wrap gap-x-3 text-sm text-ink-soft">
                  {row.repo ? (
                    <span lang="en">{row.repo.full_name}</span>
                  ) : (
                    <span>El ile eklendi</span>
                  )}
                  {row.repo?.is_fork && <span>fork</span>}
                  {row.repo?.removed && <span className="text-signal">GitHub'da artık yok</span>}
                </span>
              </Link>
              <button
                type="button"
                aria-pressed={row.is_featured}
                aria-label={row.is_featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                title={row.is_featured ? "Öne çıkan" : "Öne çıkar"}
                onClick={() => {
                  const value = !row.is_featured;
                  update(row.id, { is_featured: value });
                  run(
                    () => setFeatured(row.id, value),
                    () => update(row.id, { is_featured: !value }),
                  );
                }}
                className={`flex size-9 items-center justify-center transition-colors ${
                  row.is_featured ? "text-ink" : "text-ink-faint hover:text-ink"
                }`}
              >
                <Star
                  className="size-4"
                  fill={row.is_featured ? "currentColor" : "none"}
                  aria-hidden
                />
              </button>
              <label className="flex items-center gap-2 pl-1 text-sm text-ink-soft">
                <span className="sr-only sm:not-sr-only sm:w-14">
                  {row.is_visible ? "Sitede" : "Gizli"}
                </span>
                <Switch
                  checked={row.is_visible}
                  aria-label={`${row.title}: sitede göster`}
                  onCheckedChange={(checked) => {
                    update(row.id, { is_visible: checked });
                    run(
                      () => setVisible("projects", row.id, checked),
                      () => update(row.id, { is_visible: !checked }),
                    );
                  }}
                />
              </label>
            </div>
          )}
        />
      )}
      <p className="mt-4 text-sm text-ink-soft">
        Yıldız: kapakta ve listenin başında öne çıkar. Sitede ilk öne çıkan proje listenin başında
        çizilir.
      </p>
    </div>
  );
}
