import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, Settings2, Moon, Sun, Monitor, ShieldAlert, Search, X, Newspaper, Globe, Zap, FileUp } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Source, TabGroup } from "./types";
import { SortableKioskCard } from "./components/SortableKioskCard";
import { ComponentErrorBoundary } from "./components/ComponentErrorBoundary";
import { cn, isValidHttpUrl } from "./lib/utils";
import { TabBar } from "./components/TabBar";

const AddSourceModal = lazy(() => import("./components/AddSourceModal").then(module => ({ default: module.AddSourceModal })));
const ImportExportModal = lazy(() => import("./components/ImportExportModal").then(module => ({ default: module.ImportExportModal })));
const AddTabModal = lazy(() => import("./components/AddTabModal").then(module => ({ default: module.AddTabModal })));
const EditTabModal = lazy(() => import("./components/EditTabModal").then(module => ({ default: module.EditTabModal })));

const DEFAULT_SOURCES: Source[] = [
  { id: "1", name: "NY Times", url: "https://nytimes.com", addedAt: Date.now(), tabId: "uncategorized" },
  { id: "2", name: "The Verge", url: "https://theverge.com", addedAt: Date.now(), tabId: "uncategorized" },
  { id: "3", name: "Hacker News", url: "https://news.ycombinator.com", addedAt: Date.now(), tabId: "uncategorized" },
  { id: "4", name: "TechCrunch", url: "https://techcrunch.com", addedAt: Date.now(), tabId: "uncategorized" },
];

const DEFAULT_TAB_GROUPS: TabGroup[] = [
  {
    id: "uncategorized",
    name: "Uncategorized",
    color: "gray",
    icon: "📁",
    createdAt: Date.now(),
    isDefault: true,
  },
];

const THEME_ICONS = {
  light: <Sun size={20} />,
  dark: <Moon size={20} />,
  system: <Monitor size={20} />,
} as const;

function ModalLoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const { 
    storedValue: sources, 
    setValue: setSources, 
    error: sourcesError, 
    clearError: clearSourcesError,
    isLoading: sourcesLoading
  } = useLocalStorage<Source[]>("kiosky_sources", DEFAULT_SOURCES);
  
  const { 
    storedValue: tabGroups, 
    setValue: setTabGroups
  } = useLocalStorage<TabGroup[]>("kiosky_tab_groups", DEFAULT_TAB_GROUPS);
  
  const { 
    storedValue: theme, 
    setValue: setTheme,
    error: themeError,
    clearError: clearThemeError 
  } = useLocalStorage<"light" | "dark" | "system">("theme", "system");
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<TabGroup | null>(null);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabId, setActiveTabId] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (tabGroups.length === 0) {
      setTabGroups(DEFAULT_TAB_GROUPS);
    }
    
    const sourcesNeedMigration = sources.some(s => !s.tabId);
    if (sourcesNeedMigration) {
      setSources(prev => prev.map(s => ({
        ...s,
        tabId: s.tabId || "uncategorized"
      })));
    }
  }, [sources, tabGroups.length, setSources, setTabGroups]);

  const getEffectiveTheme = useCallback(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    const effectiveTheme = getEffectiveTheme();
    root.classList.add(effectiveTheme);
    
    const faviconLink = document.getElementById("dynamic-favicon") as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = effectiveTheme === "dark" ? "./Favicon_Dark.png" : "./Favicon_Light.png";
    }
  }, [theme, getEffectiveTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
      
      const faviconLink = document.getElementById("dynamic-favicon") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = e.matches ? "./Favicon_Dark.png" : "./Favicon_Light.png";
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }, [theme, setTheme]);

  const handleAddSource = useCallback((source: Source) => {
    if (!isValidHttpUrl(source.url)) {
      alert("Invalid URL. Please enter a valid HTTP or HTTPS URL.");
      return;
    }
    setSources((prevSources) => [...prevSources, source]);
    setIsAddModalOpen(false);
  }, [setSources]);

  const handleAddTab = useCallback((tab: TabGroup) => {
    setTabGroups((prevTabs) => [...prevTabs, tab]);
    setIsAddTabModalOpen(false);
  }, [setTabGroups]);

  const handleUpdateTab = useCallback((updatedTab: TabGroup) => {
    setTabGroups((prevTabs) =>
      prevTabs.map((t) => (t.id === updatedTab.id ? updatedTab : t))
    );
    setEditingTab(null);
  }, [setTabGroups]);

  const handleDeleteTab = useCallback((tabId: string) => {
    const tabToDelete = tabGroups.find(t => t.id === tabId);
    if (!tabToDelete || tabToDelete.isDefault) {
      return;
    }
    
    if (!window.confirm(`Delete "${tabToDelete.name}" tab? Sources will be moved to Uncategorized.`)) {
      return;
    }
    
    setSources((prevSources) =>
      prevSources.map((s) =>
        s.tabId === tabId ? { ...s, tabId: "uncategorized" } : s
      )
    );
    
    setTabGroups((prevTabs) => prevTabs.filter((t) => t.id !== tabId));
    
    if (activeTabId === tabId) {
      setActiveTabId("all");
    }
  }, [tabGroups, activeTabId, setSources, setTabGroups]);

  const handleDeleteSource = useCallback((id: string) => {
    const sourceToDelete = sources.find(s => s.id === id);
    if (sourceToDelete && !window.confirm(`Delete "${sourceToDelete.name}"?`)) {
      return;
    }
    setSources((prevSources) => prevSources.filter((s) => s.id !== id));
  }, [setSources, sources]);

  const handleEditSource = useCallback((source: Source) => {
    setEditingSource(source);
    setIsEditMode(false);
  }, []);

  const handleUpdateSource = useCallback((updatedSource: Source) => {
    setSources((prevSources) => 
      prevSources.map((s) => (s.id === updatedSource.id ? updatedSource : s))
    );
    setEditingSource(null);
  }, [setSources]);

  const handleImportSources = useCallback((importedSources: Source[], importedTabGroups?: TabGroup[]) => {
    setSources((prevSources) => {
      const existingIds = new Set(prevSources.map(s => s.id));
      const newSources = importedSources.filter(s => !existingIds.has(s.id));
      return [...prevSources, ...newSources];
    });
    
    if (importedTabGroups && importedTabGroups.length > 0) {
      setTabGroups((prevTabs) => {
        const existingIds = new Set(prevTabs.map(t => t.id));
        const newTabs = importedTabGroups.filter(t => !existingIds.has(t.id));
        return [...prevTabs, ...newTabs];
      });
    }
  }, [setSources, setTabGroups]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handleDragEnd = useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSources((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }
        
        const newItems = [...items];
        const removed = newItems.splice(oldIndex, 1)[0];
        if (!removed) {
          return items;
        }
        newItems.splice(newIndex, 0, removed);
        
        return newItems;
      });
    }
  }, [setSources]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isModalOpen = isAddModalOpen || !!editingSource;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isModalOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && searchQuery) {
        handleClearSearch();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, isModalOpen, handleClearSearch]);

  const filteredSources = useMemo(() => {
    let result = sources;
    
    if (activeTabId !== "all") {
      result = result.filter(source => source.tabId === activeTabId);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(source => 
        source.name.toLowerCase().includes(query) ||
        source.url.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [sources, activeTabId, searchQuery]);

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 lg:p-24 max-w-6xl mx-auto">
      {(sourcesError || themeError) && (
        <div 
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start justify-between gap-3"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-500">Storage Error</h3>
              <p className="text-sm text-red-700 dark:text-red-600/90">
                {sourcesError || themeError}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearSourcesError();
              clearThemeError();
            }}
            className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium shrink-0"
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      {sourcesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">Loading your newsstand...</p>
          </div>
        </div>
      ) : (
        <>
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <img
            key={getEffectiveTheme()}
            src={getEffectiveTheme() === "dark" ? "./Kiosky_Logo_Dark.png" : "./Kiosky_Logo_Light.png"}
            alt="Kiosky"
            className="h-16 md:h-20 w-auto object-contain"
          />
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources..."
              className="w-48 px-4 py-2 pl-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 text-sm"
              aria-label="Search sources"
            />
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Clear search"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-300"
            aria-label={`Toggle theme (current: ${theme})`}
            type="button"
          >
            {THEME_ICONS[theme]}
          </button>
          
          <button
            onClick={() => setIsImportExportModalOpen(true)}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-300"
            aria-label="Import or export sources"
            type="button"
          >
            <FileUp size={20} />
          </button>
          
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md",
              isEditMode 
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
            type="button"
          >
            <Settings2 size={20} className={cn(isEditMode && "animate-spin-slow")} />
            {isEditMode ? "Done Editing" : "Edit Mode"}
          </button>
        </div>
      </header>

      <Suspense fallback={<ModalLoadingSpinner />}>
        <TabBar
          tabGroups={tabGroups}
          sources={sources}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onAddTab={() => setIsAddTabModalOpen(true)}
          onEditTab={(tab) => setEditingTab(tab)}
          onDeleteTab={handleDeleteTab}
          isEditMode={isEditMode}
        />
      </Suspense>

      <main>
        {isEditMode && (
          <div 
            className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3"
            role="status"
            aria-live="polite"
          >
            <ShieldAlert className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-500">Edit Mode Active</h3>
              <p className="text-sm text-amber-700 dark:text-amber-600/90">
                You can now remove sources or add new ones. Changes are saved automatically.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400" role="status" aria-live="polite">
          {filteredSources.length} of {sources.length} sources
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {filteredSources.length === 0 && searchQuery ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400 mb-2">
              No sources found matching "{searchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              type="button"
            >
              Clear search
            </button>
          </div>
        ) : sources.length === 0 && !isEditMode ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <div className="mb-6 flex justify-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Newspaper className="text-blue-600 dark:text-blue-400" size={48} />
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <Globe className="text-purple-600 dark:text-purple-400" size={48} />
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                <Zap className="text-orange-600 dark:text-orange-400" size={48} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Welcome to Your Personal Newsstand
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Kiosky helps you organize and access your favorite websites in one beautiful place. 
              Start by adding your first source.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setIsEditMode(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                type="button"
              >
                <Plus size={20} />
                Add Your First Source
              </button>
            </div>
            
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-3">Popular sources to get started:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-full transition-colors"
                  type="button"
                >
                  📰 News
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-full transition-colors"
                  type="button"
                >
                  💻 Tech
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-full transition-colors"
                  type="button"
                >
                  🎮 Entertainment
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm rounded-full transition-colors"
                  type="button"
                >
                  📺 YouTube
                </button>
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6" 
              role="list"
              aria-label="News sources"
            >
              {filteredSources.map((source) => (
                <ComponentErrorBoundary
                  key={source.id}
                  name={`KioskCard: ${source.name}`}
                >
                  <SortableKioskCard
                    source={source}
                    isEditMode={isEditMode}
                    onDelete={handleDeleteSource}
                    onEdit={handleEditSource}
                  />
                </ComponentErrorBoundary>
              ))}
              
              {isEditMode && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex flex-col items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 h-[154px] hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                  aria-label="Add new source"
                  type="button"
                  role="listitem"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center rounded-xl bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                    Add Source
                  </span>
                </button>
              )}
            </div>
          </DndContext>
        )}
      </main>

      {isAddModalOpen && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <ComponentErrorBoundary name="AddSourceModal">
            <AddSourceModal
              onClose={() => setIsAddModalOpen(false)}
              onAdd={handleAddSource}
              existingSources={sources}
              tabGroups={tabGroups}
              activeTabId={activeTabId === "all" ? "uncategorized" : activeTabId}
            />
          </ComponentErrorBoundary>
        </Suspense>
      )}

      {editingSource && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <ComponentErrorBoundary name="EditSourceModal">
            <AddSourceModal
              onClose={() => setEditingSource(null)}
              onEdit={handleUpdateSource}
              editSource={editingSource}
              existingSources={sources}
              tabGroups={tabGroups}
            />
          </ComponentErrorBoundary>
        </Suspense>
      )}

      {isAddTabModalOpen && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <ComponentErrorBoundary name="AddTabModal">
            <AddTabModal
              onClose={() => setIsAddTabModalOpen(false)}
              onAdd={handleAddTab}
              existingTabs={tabGroups}
            />
          </ComponentErrorBoundary>
        </Suspense>
      )}

      {editingTab && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <ComponentErrorBoundary name="EditTabModal">
            <EditTabModal
              onClose={() => setEditingTab(null)}
              onUpdate={handleUpdateTab}
              existingTabs={tabGroups}
              editTab={editingTab}
            />
          </ComponentErrorBoundary>
        </Suspense>
      )}

      {isImportExportModalOpen && (
        <Suspense fallback={<ModalLoadingSpinner />}>
          <ComponentErrorBoundary name="ImportExportModal">
            <ImportExportModal
              onClose={() => setIsImportExportModalOpen(false)}
              sources={sources}
              tabGroups={tabGroups}
              onImport={handleImportSources}
            />
          </ComponentErrorBoundary>
        </Suspense>
      )}
      </>
    )}
  </div>
);
}

export default App;
