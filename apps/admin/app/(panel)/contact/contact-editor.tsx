"use client";

import { contactKinds } from "@repo/content";
import type { Tables } from "@repo/db";
import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteRow, reorderRows } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createContactLink, updateContactLink } from "./actions";

type Link = Tables<"contact_links">;

const KIND_LABELS: Record<Link["kind"], string> = {
  email: "E-posta",
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  website: "Web sitesi",
  other: "Diğer",
};

export function ContactEditor({ initial }: { initial: Link[] }) {
  const [links, setLinks] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(next: Link) {
    const previous = links;
    setLinks((current) => current.map((l) => (l.id === next.id ? next : l)));
    startTransition(async () => {
      const result = await updateContactLink(next.id, {
        kind: next.kind,
        label: next.label,
        url: next.url,
        is_visible: next.is_visible,
      });
      if (!result.ok) {
        setLinks(previous);
        setError(result.error);
      } else setError(null);
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-signal">
          {error}
        </p>
      )}
      {links.length === 0 && (
        <p className="border-y border-ink py-6 text-ink-soft">Henüz bağlantı yok.</p>
      )}

      <SortableList
        id="contact-links"
        items={links}
        className="border-t border-ink"
        onReorder={(next) => {
          const previous = links;
          setLinks(next);
          startTransition(async () => {
            const result = await reorderRows(
              "contact_links",
              next.map((l) => l.id),
            );
            if (!result.ok) {
              setLinks(previous);
              setError(result.error);
            }
          });
        }}
        renderItem={(link, handle) => (
          <div className="flex flex-wrap items-center gap-2 border-b border-rule py-2 pr-2 lg:flex-nowrap">
            {handle}
            <select
              aria-label="Tür"
              value={link.kind}
              onChange={(e) => save({ ...link, kind: e.target.value as Link["kind"] })}
              className="h-8 border border-input bg-paper px-2 text-sm"
            >
              {contactKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </option>
              ))}
            </select>
            <Input
              aria-label="Görünen ad"
              defaultValue={link.label}
              className="w-44"
              onBlur={(e) =>
                e.target.value !== link.label && save({ ...link, label: e.target.value })
              }
            />
            <Input
              aria-label="Adres"
              defaultValue={link.url}
              placeholder={link.kind === "email" ? "ad@ornek.com" : "https://"}
              className="min-w-48 flex-1"
              onBlur={(e) => e.target.value !== link.url && save({ ...link, url: e.target.value })}
            />
            <Switch
              checked={link.is_visible}
              aria-label={`${link.label}: sitede göster`}
              onCheckedChange={(checked) => save({ ...link, is_visible: checked })}
            />
            <button
              type="button"
              aria-label={`${link.label}: sil`}
              onClick={() => {
                const previous = links;
                setLinks((current) => current.filter((l) => l.id !== link.id));
                startTransition(async () => {
                  const result = await deleteRow("contact_links", link.id);
                  if (!result.ok) {
                    setLinks(previous);
                    setError(result.error);
                  }
                });
              }}
              className="flex size-9 items-center justify-center text-ink-soft hover:text-signal"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        )}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await createContactLink();
            if (!result.ok || !result.data) {
              setError(result.ok ? "Bağlantı eklenemedi." : result.error);
              return;
            }
            const { id, position } = result.data;
            setLinks((current) => [
              ...current,
              {
                id,
                position,
                kind: "website",
                label: "Yeni bağlantı",
                url: "https://",
                is_visible: false,
              },
            ]);
          })
        }
      >
        <Plus aria-hidden />
        Bağlantı ekle
      </Button>
      <p className="text-sm text-ink-soft">
        Yeni bağlantılar gizli başlar: adresi girip anahtarı açınca sitede görünür.
      </p>
    </div>
  );
}
