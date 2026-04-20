import { ExternalLink, Trash2 } from "lucide-react";
import type { Source } from "../types";
import { cn, getFaviconUrl } from "../lib/utils";

interface KioskCardProps {
  source: Source;
  isEditMode: boolean;
  onDelete: (id: string) => void;
}

export function KioskCard({ source, isEditMode, onDelete }: KioskCardProps) {
  const faviconUrl = getFaviconUrl(source.url);

  // Parse the URL to show something clean if needed, 
  // but we prefer showing the provided name.
  
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
        isEditMode ? "animate-pulse-subtle cursor-default" : "cursor-pointer"
      )}
      onClick={() => {
        if (!isEditMode) {
          window.open(source.url, "_blank", "noopener,noreferrer");
        }
      }}
    >
      {/* Delete button in edit mode */}
      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(source.id);
          }}
          className="absolute top-2 right-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors z-10"
          aria-label={`Delete ${source.name}`}
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* External link indicator */}
      {!isEditMode && (
        <div className="absolute top-3 right-3 text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={16} />
        </div>
      )}

      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 shadow-inner overflow-hidden">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt={`${source.name} icon`}
            className="w-10 h-10 object-contain drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={cn("text-2xl font-semibold text-zinc-400 dark:text-zinc-500 uppercase", faviconUrl ? "hidden" : "block")}>
          {source.name.charAt(0)}
        </div>
      </div>

      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200 text-center truncate w-full">
        {source.name}
      </h3>
    </div>
  );
}
