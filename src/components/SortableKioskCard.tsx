import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
  } = useSortable({ id: source.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <div className="relative">
        {isEditMode && (
          <button
            {...attributes}
            {...listeners}
            className="absolute -top-2 -left-2 z-10 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-colors"
            aria-label="Drag to reorder"
            type="button"
          >
            <GripVertical size={16} />
          </button>
        )}
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
