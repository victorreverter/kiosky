import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TabGroup, Source, TabColor } from "../types";
import { cn } from "../lib/utils";

interface TabBarProps {
  tabGroups: TabGroup[];
  sources: Source[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onAddTab: () => void;
  onEditTab: (tab: TabGroup) => void;
  onDeleteTab: (tabId: string) => void;
  isEditMode: boolean;
  overTabId?: string | null;
}

function DroppableTab({
  tab,
  isActive,
  count,
  colorStyle,
  isEditMode,
  isOver,
  onTabChange,
  onEditTab,
  onDeleteTab,
}: {
  tab: { id: string; name: string; icon: string; color: TabColor; isDefault?: boolean };
  isActive: boolean;
  count: number;
  colorStyle: ReturnType<typeof getColorStyle>;
  isEditMode: boolean;
  isOver: boolean;
  onTabChange: (tabId: string) => void;
  onEditTab: (tab: TabGroup) => void;
  onDeleteTab: (tabId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: `tab-drop-${tab.id}` });

  return (
    <div
      ref={isEditMode ? setNodeRef : undefined}
      className={cn(
        "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer group",
        isActive
          ? `${colorStyle.border} ${colorStyle.light} shadow-sm`
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800",
        isOver && "border-[#ee6254] bg-amber-50/60 dark:bg-amber-900/20 shadow-md"
      )}
      onClick={() => onTabChange(tab.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTabChange(tab.id);
        }
      }}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
    >
      <span className="text-lg">{tab.icon}</span>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
        {tab.name}
      </span>
      <span
        className={cn(
          "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
          isActive ? colorStyle.bg + " text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        )}
      >
        {count}
      </span>

      {isEditMode && !tab.isDefault && tab.id !== "all" && (
        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditTab(tab as TabGroup);
            }}
            className={cn(
              "p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
              colorStyle.text
            )}
            aria-label={`Edit ${tab.name} tab`}
            type="button"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTab(tab.id);
            }}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            aria-label={`Delete ${tab.name} tab`}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SortableDroppableTab({
  tab,
  isActive,
  count,
  colorStyle,
  isEditMode,
  isOver,
  onTabChange,
  onEditTab,
  onDeleteTab,
}: {
  tab: { id: string; name: string; icon: string; color: TabColor; isDefault?: boolean };
  isActive: boolean;
  count: number;
  colorStyle: ReturnType<typeof getColorStyle>;
  isEditMode: boolean;
  isOver: boolean;
  onTabChange: (tabId: string) => void;
  onEditTab: (tab: TabGroup) => void;
  onDeleteTab: (tabId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const { setNodeRef: setDroppableRef } = useDroppable({ id: `tab-drop-${tab.id}` });

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      setSortableRef(node);
      setDroppableRef(node);
    },
    [setSortableRef, setDroppableRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={mergedRef} style={style}>
      <div
        className={cn(
          "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer group",
          isActive
            ? `${colorStyle.border} ${colorStyle.light} shadow-sm`
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800",
          isOver && "border-[#ee6254] bg-amber-50/60 dark:bg-amber-900/20 shadow-md",
          isDragging && "shadow-lg border-[#ee6254]"
        )}
        onClick={() => onTabChange(tab.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTabChange(tab.id);
          }
        }}
        aria-selected={isActive}
        {...attributes}
        {...listeners}
      >
        <span className="text-lg">{tab.icon}</span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
          {tab.name}
        </span>
        <span
          className={cn(
            "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
            isActive ? colorStyle.bg + " text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {count}
        </span>

        {isEditMode && !tab.isDefault && tab.id !== "all" && (
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-zinc-200 dark:border-zinc-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditTab(tab as TabGroup);
              }}
              className={cn(
                "p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
                colorStyle.text
              )}
              aria-label={`Edit ${tab.name} tab`}
              type="button"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTab(tab.id);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              aria-label={`Delete ${tab.name} tab`}
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const TAB_COLORS = {
  blue: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-500",
    border: "border-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  purple: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  red: {
    bg: "bg-red-500",
    border: "border-red-500",
    light: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  orange: {
    bg: "bg-orange-500",
    border: "border-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  pink: {
    bg: "bg-pink-500",
    border: "border-pink-500",
    light: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-600 dark:text-pink-400",
  },
  gray: {
    bg: "bg-gray-500",
    border: "border-gray-500",
    light: "bg-gray-50 dark:bg-gray-900/20",
    text: "text-gray-600 dark:text-gray-400",
  },
};

function getColorStyle(color: TabColor) {
  return TAB_COLORS[color as keyof typeof TAB_COLORS];
}

const ALL_TAB = {
  id: "all",
  name: "All Sources",
  icon: "📰",
  color: "orange" as TabColor,
  isDefault: true,
};

export function TabBar({
  tabGroups,
  sources,
  activeTabId,
  onTabChange,
  onAddTab,
  onEditTab,
  onDeleteTab,
  isEditMode,
  overTabId,
}: TabBarProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getSourceCount = useCallback((tabId: string) => {
    return sources.filter(s => s.tabId === tabId).length;
  }, [sources]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === "left"
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const allTabs = [ALL_TAB, ...tabGroups];
  const sortableTabIds = tabGroups.map(t => t.id);

  return (
    <div className="relative mb-8">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Scroll left"
          type="button"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Scroll right"
          type="button"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        role="tablist"
        aria-label="Source categories"
      >
        <SortableContext items={sortableTabIds} strategy={horizontalListSortingStrategy}>
          {allTabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const count = tab.id === "all" ? sources.length : getSourceCount(tab.id);
            const colorStyle = getColorStyle(tab.color as TabColor);
            const isDefault = tab.id === "all";

            if (isDefault) {
              return (
                <DroppableTab
                  key={tab.id}
                  tab={tab as { id: string; name: string; icon: string; color: TabColor; isDefault?: boolean }}
                  isActive={isActive}
                  count={count}
                  colorStyle={colorStyle}
                  isEditMode={isEditMode}
                  isOver={overTabId === tab.id}
                  onTabChange={onTabChange}
                  onEditTab={onEditTab}
                  onDeleteTab={onDeleteTab}
                />
              );
            }

            return (
              <SortableDroppableTab
                key={tab.id}
                tab={tab as { id: string; name: string; icon: string; color: TabColor; isDefault?: boolean }}
                isActive={isActive}
                count={count}
                colorStyle={colorStyle}
                isEditMode={isEditMode}
                isOver={overTabId === tab.id}
                onTabChange={onTabChange}
                onEditTab={onEditTab}
                onDeleteTab={onDeleteTab}
              />
            );
          })}
        </SortableContext>

        <button
          onClick={onAddTab}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-dashed border-amber-300/50 dark:border-amber-700/40",
            "bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all opacity-70 hover:opacity-100 cursor-pointer"
          )}
          aria-label="Add new tab"
          type="button"
        >
          <Plus size={18} className="text-amber-500 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Add Tab</span>
        </button>
      </div>
    </div>
  );
}
