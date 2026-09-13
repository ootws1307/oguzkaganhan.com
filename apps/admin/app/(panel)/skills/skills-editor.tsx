"use client";

import type { Localized } from "@repo/content";
import type { SkillGroup } from "@repo/db";
import { Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteRow, reorderRows, setVisible } from "@/app/(panel)/actions";
import { SortableList } from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { addSkill, createSkillGroup, renameSkillGroup } from "./actions";

type Group = SkillGroup;
type Result = { ok: boolean; error?: string };

export function SkillsEditor({ initial }: { initial: Group[] }) {
  const [groups, setGroups] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<Result>, undo?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        undo?.();
        setError(result.error ?? "Kaydedilemedi.");
      } else setError(null);
    });
  }

  function patchGroup(id: string, patch: Partial<Group>) {
    setGroups((current) => current.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-signal">
          {error}
        </p>
      )}

      {groups.length === 0 && (
        <p className="border-y border-ink py-6 text-ink-soft">
          Henüz grup yok. Örn. "Diller", "Araçlar".
        </p>
      )}

      <SortableList
        id="skill-groups"
        items={groups}
        className="space-y-4"
        onReorder={(next) => {
          const previous = groups;
          setGroups(next);
          run(
            () =>
              reorderRows(
                "skill_groups",
                next.map((g) => g.id),
              ),
            () => setGroups(previous),
          );
        }}
        renderItem={(group, handle) => (
          <GroupBlock
            group={group}
            handle={handle}
            onRename={(name) => {
              patchGroup(group.id, { name });
              run(() => renameSkillGroup(group.id, name));
            }}
            onVisible={(visible) => {
              patchGroup(group.id, { is_visible: visible });
              run(
                () => setVisible("skill_groups", group.id, visible),
                () => patchGroup(group.id, { is_visible: !visible }),
              );
            }}
            onDelete={() => {
              if (!window.confirm("Grup ve içindeki yetenekler silinsin mi?")) return;
              const previous = groups;
              setGroups((current) => current.filter((g) => g.id !== group.id));
              run(
                () => deleteRow("skill_groups", group.id),
                () => setGroups(previous),
              );
            }}
            onSkills={(skills) => patchGroup(group.id, { skills })}
            run={run}
          />
        )}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await createSkillGroup();
            if (!result.ok || !result.data) {
              setError(result.ok ? "Grup oluşturulamadı." : result.error);
              return;
            }
            const { id, position } = result.data;
            setGroups((current) => [
              ...current,
              {
                id,
                position,
                name: { tr: "", en: "" },
                is_visible: true,
                updated_at: new Date().toISOString(),
                skills: [],
              },
            ]);
          })
        }
      >
        <Plus aria-hidden />
        Grup ekle
      </Button>
    </div>
  );
}

function GroupBlock({
  group,
  handle,
  onRename,
  onVisible,
  onDelete,
  onSkills,
  run,
}: {
  group: Group;
  handle: React.ReactNode;
  onRename: (name: Localized<string>) => void;
  onVisible: (visible: boolean) => void;
  onDelete: () => void;
  onSkills: (skills: Group["skills"]) => void;
  run: (action: () => Promise<Result>, undo?: () => void) => void;
}) {
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  function add() {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    startTransition(async () => {
      const result = await addSkill(group.id, name);
      if (result.ok && result.data) {
        onSkills([
          ...group.skills,
          { id: result.data.id, group_id: group.id, name, position: result.data.position },
        ]);
      }
    });
  }

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink py-1.5 pr-2">
        {handle}
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
          {(["tr", "en"] as const).map((locale) => (
            <label key={locale} lang={locale} className="flex items-center gap-2">
              <span className="caps w-6 text-xs text-ink-soft">{locale.toUpperCase()}</span>
              <Input
                defaultValue={group.name[locale]}
                placeholder={locale === "tr" ? "Grup adı" : "Group name"}
                aria-label={`Grup adı (${locale.toUpperCase()})`}
                className="caps"
                onBlur={(e) => {
                  if (e.target.value !== group.name[locale]) {
                    onRename({ ...group.name, [locale]: e.target.value });
                  }
                }}
              />
            </label>
          ))}
        </div>
        <Switch
          checked={group.is_visible}
          onCheckedChange={onVisible}
          aria-label="Grubu sitede göster"
        />
        <button
          type="button"
          onClick={onDelete}
          aria-label="Grubu sil"
          className="flex size-9 items-center justify-center text-ink-soft hover:text-signal"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <div className="p-3">
        {group.skills.length > 0 && (
          <SortableList
            id={`skills-${group.id}`}
            items={group.skills}
            className="mb-3 grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3"
            onReorder={(next) => {
              const previous = group.skills;
              onSkills(next);
              run(
                () =>
                  reorderRows(
                    "skills",
                    next.map((s) => s.id),
                  ),
                () => onSkills(previous),
              );
            }}
            renderItem={(skill, skillHandle) => (
              <div className="flex items-center gap-1 border-b border-rule">
                {skillHandle}
                <span className="min-w-0 flex-1 truncate">{skill.name}</span>
                <button
                  type="button"
                  aria-label={`${skill.name}: kaldır`}
                  onClick={() => {
                    const previous = group.skills;
                    onSkills(group.skills.filter((s) => s.id !== skill.id));
                    run(
                      () => deleteRow("skills", skill.id),
                      () => onSkills(previous),
                    );
                  }}
                  className="flex size-8 items-center justify-center text-ink-soft hover:text-signal"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            )}
          />
        )}
        <div className="flex max-w-md gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Yetenek ekle (Enter)"
            aria-label="Yeni yetenek"
          />
          <Button type="button" variant="outline" onClick={add}>
            Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}
