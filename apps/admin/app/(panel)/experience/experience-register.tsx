"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderRows, setVisible } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Switch } from "@/components/ui/switch";

type Row = {
  id: string;
  kind: "work" | "education";
  organization: string;
  role: string;
  started_on: string;
  ended_on: string | null;
  is_visible: boolean;
};

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { month: "short", year: "numeric" }).format(new Date(iso));

export function ExperienceRegister({ items }: { items: Row[] }) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (rows.length === 0) {
    return <p className="border-y border-ink py-6 text-ink-soft">Henüz kayıt yok.</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-signal">
          {error}
        </p>
      )}
      <SortableList
        id="experience"
        items={rows}
        className="border-t border-ink"
        onReorder={(next) => {
          const previous = rows;
          setRows(next);
          startTransition(async () => {
            const result = await reorderRows(
              "experiences",
              next.map((r) => r.id),
            );
            if (!result.ok) {
              setRows(previous);
              setError(result.error);
            }
          });
        }}
        renderItem={(row, handle) => (
          <div className="flex items-center gap-2 border-b border-rule py-1.5 pr-2">
            {handle}
            <span className="caps w-16 shrink-0 text-xs text-ink-soft">
              {row.kind === "work" ? "Deneyim" : "Eğitim"}
            </span>
            <Link
              href={`/experience/${row.id}`}
              className="group flex min-w-0 flex-1 flex-col py-1.5"
            >
              <span className="flex items-baseline gap-3">
                <span className="truncate text-lg leading-tight font-semibold group-hover:underline">
                  {row.role || row.organization}
                </span>
                <ChevronRight
                  className="ml-auto size-4 shrink-0 self-center text-ink-soft"
                  aria-hidden
                />
              </span>
              <span className="text-sm text-ink-soft">
                {row.organization} · {monthYear(row.started_on)} –{" "}
                {row.ended_on ? monthYear(row.ended_on) : "devam ediyor"}
              </span>
            </Link>
            <Switch
              checked={row.is_visible}
              aria-label={`${row.organization}: sitede göster`}
              onCheckedChange={(checked) => {
                setRows((current) =>
                  current.map((r) => (r.id === row.id ? { ...r, is_visible: checked } : r)),
                );
                startTransition(async () => {
                  const result = await setVisible("experiences", row.id, checked);
                  if (!result.ok) setError(result.error);
                });
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
