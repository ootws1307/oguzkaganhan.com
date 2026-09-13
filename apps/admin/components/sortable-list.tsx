"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

type Props<T extends { id: string }> = {
  /** Stable id so server and client render the same accessibility markup. */
  id: string;
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: ReactNode) => ReactNode;
  className?: string;
};

const announcements = {
  onDragStart: ({ active }: { active: { id: unknown } }) => `${String(active.id)} tutuldu.`,
  onDragOver: () => "Taşınıyor.",
  onDragEnd: () => "Bırakıldı.",
  onDragCancel: () => "Sıralama iptal edildi.",
};

/** A register whose rows can be reordered by pointer or keyboard (space, arrows, space). */
export function SortableList<T extends { id: string }>({
  id,
  items,
  onReorder,
  renderItem,
  className,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Sıralamak için boşluk tuşuna bas, ok tuşlarıyla taşı, bırakmak için tekrar boşluk. İptal için Escape.",
        },
      }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ol className={className}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableRow>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Sürükleyerek sırala"
      className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center text-ink-soft hover:text-ink active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={
        isDragging ? "relative z-10 bg-paper-deep outline outline-1 outline-ink" : undefined
      }
    >
      {children(handle)}
    </li>
  );
}
