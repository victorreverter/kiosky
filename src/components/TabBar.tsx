import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const TAB_COLORS = {
  blue: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
  },
  green: {
    bg: "bg-green-500",
    border: "border-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
  },
  purple: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
  },
  red: {
    bg: "bg-red-500",
    border: "border-red-500",
    light: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
  },
  orange: {
    bg: "bg-orange-500",
    border: "border-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
  },
  pink: {
    bg: "bg-pink-500",
    border: "border-pink-500",
    light: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-600 dark:text-pink-400",
    hover: "hover:bg-pink-100 dark:hover:bg-pink-900/30",
  },
  gray: {
    bg: "bg-gray-500",
    border: "border-gray-500",
    light: "bg-gray-50 dark:bg-gray-900/20",
    text: "text-gray-600 dark:text-gray-400",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-900/30",
  },
};

const ALL_TAB = {
  id: "all",
  name: "All Sources",
  icon: "📰",
  color: "blue" as TabColor,
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTabChange(tabId);
    }
  }, [onTabChange]);

  const allTabs = [ALL_TAB, ...tabGroups];

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
        {allTabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const count = tab.id === "all" ? sources.length : getSourceCount(tab.id);
          const colorStyle = TAB_COLORS[tab.color as keyof typeof TAB_COLORS];

          return (
            <div
              key={tab.id}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer group",
                isActive
                  ? `${colorStyle.border} ${colorStyle.light} shadow-sm`
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
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
        })}

        {isEditMode && (
          <button
            onClick={onAddTab}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700",
              "hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            )}
            aria-label="Add new tab"
            type="button"
          >
            <Plus size={18} className="text-zinc-400" />
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Add Tab</span>
          </button>
        )}
      </div>
    </div>
  );
}
