import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Settings2, Moon, Sun, Monitor, ShieldAlert } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Source } from "./types";
import { KioskCard } from "./components/KioskCard";
import { AddSourceModal } from "./components/AddSourceModal";
import { cn } from "./lib/utils";

const DEFAULT_SOURCES: Source[] = [
  { id: "1", name: "NY Times", url: "https://nytimes.com", addedAt: Date.now() },
  { id: "2", name: "The Verge", url: "https://theverge.com", addedAt: Date.now() },
  { id: "3", name: "Hacker News", url: "https://news.ycombinator.com", addedAt: Date.now() },
  { id: "4", name: "TechCrunch", url: "https://techcrunch.com", addedAt: Date.now() },
];

const THEME_ICONS = {
  light: <Sun size={20} />,
  dark: <Moon size={20} />,
  system: <Monitor size={20} />,
} as const;

function App() {
  const [sources, setSources] = useLocalStorage<Source[]>("kiosky_sources", DEFAULT_SOURCES);
  const [theme, setTheme] = useLocalStorage<"light" | "dark" | "system">("theme", "system");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
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
    setSources((prevSources) => [...prevSources, source]);
    setIsAddModalOpen(false);
  }, [setSources]);

  const handleDeleteSource = useCallback((id: string) => {
    setSources((prevSources) => prevSources.filter((s) => s.id !== id));
  }, [setSources]);

  const currentThemeIcon = useMemo(() => THEME_ICONS[theme], [theme]);

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 lg:p-24 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">Kiosky</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Your personal digital newsstand.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-300"
            aria-label={`Toggle theme (current: ${theme})`}
            type="button"
          >
            {currentThemeIcon}
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

      <main>
        {isEditMode && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <ShieldAlert className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-500">Edit Mode Active</h3>
              <p className="text-sm text-amber-700 dark:text-amber-600/90">
                You can now remove sources or add new ones. Changes are saved automatically.
              </p>
            </div>
          </div>
        )}

        {sources.length === 0 && !isEditMode ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">Your newsstand is empty.</p>
            <button
              onClick={() => setIsEditMode(true)}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              type="button"
            >
              Enter Edit Mode to add sources
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sources.map((source) => (
              <KioskCard
                key={source.id}
                source={source}
                isEditMode={isEditMode}
                onDelete={handleDeleteSource}
              />
            ))}
            
            {isEditMode && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 h-[154px] hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                aria-label="Add new source"
                type="button"
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
        )}
      </main>

      {isAddModalOpen && (
        <AddSourceModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddSource}
        />
      )}
    </div>
  );
}

export default App;
