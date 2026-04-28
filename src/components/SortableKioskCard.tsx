import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KioskCard as KioskCardBase } from "./KioskCard";
import type { Source } from "../types";

interface SortableKioskCardProps {
  source: Source;
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onEdit: (source: Source) => void;
}

export function SortableKioskCard({ source, isEditMode, onDelete, onEdit }: SortableKioskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: source.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <div className="relative" {...attributes} {...listeners}>
        <KioskCardBase
          source={source}
          isEditMode={isEditMode}
          onDelete={onDelete}
          onEdit={onEdit}
          index={0}
          totalItems={0}
        />
      </div>
    </div>
  );
}
