import { useState, useRef, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import type { TabGroup, TabColor } from "../types";

interface EditTabModalProps {
  onClose: () => void;
  onUpdate: (tab: TabGroup) => void;
  existingTabs: TabGroup[];
  editTab: TabGroup;
}

const TAB_COLORS: TabColor[] = ['blue', 'green', 'purple', 'red', 'orange', 'pink', 'gray'];

const COLOR_CLASSES = {
  blue: 'bg-blue-500 hover:bg-blue-600 ring-blue-500',
  green: 'bg-green-500 hover:bg-green-600 ring-green-500',
  purple: 'bg-purple-500 hover:bg-purple-600 ring-purple-500',
  red: 'bg-red-500 hover:bg-red-600 ring-red-500',
  orange: 'bg-orange-500 hover:bg-orange-600 ring-orange-500',
  pink: 'bg-pink-500 hover:bg-pink-600 ring-pink-500',
  gray: 'bg-gray-500 hover:bg-gray-600 ring-gray-500',
};

const TAB_COLOR_DETAILS = {
  blue: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
  },
  green: {
    bg: "bg-green-500",
    border: "border-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
  },
  purple: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
  },
  red: {
    bg: "bg-red-500",
    border: "border-red-500",
    light: "bg-red-50 dark:bg-red-900/20",
  },
  orange: {
    bg: "bg-orange-500",
    border: "border-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
  },
  pink: {
    bg: "bg-pink-500",
    border: "border-pink-500",
    light: "bg-pink-50 dark:bg-pink-900/20",
  },
  gray: {
    bg: "bg-gray-500",
    border: "border-gray-500",
    light: "bg-gray-50 dark:bg-gray-900/20",
  },
};

const FLAG_ICONS = [
  { icon: '🇺🇸', label: 'USA' },
  { icon: '🇬🇧', label: 'UK' },
  { icon: '🇳🇱', label: 'Netherlands' },
  { icon: '🇩🇪', label: 'Germany' },
  { icon: '🇫🇷', label: 'France' },
  { icon: '🇪🇸', label: 'Spain' },
  { icon: '🇮🇹', label: 'Italy' },
  { icon: '🇯🇵', label: 'Japan' },
  { icon: '🇰🇷', label: 'Korea' },
  { icon: '🇨🇳', label: 'China' },
  { icon: '🇮🇳', label: 'India' },
  { icon: '🇧🇷', label: 'Brazil' },
  { icon: '🇦🇺', label: 'Australia' },
  { icon: '🇨🇦', label: 'Canada' },
];

const CATEGORY_ICONS = [
  { icon: '📰', label: 'News' },
  { icon: '🗞️', label: 'Newspaper' },
  { icon: '💻', label: 'Technology' },
  { icon: '🖥️', label: 'Computer' },
  { icon: '⌨️', label: 'Keyboard' },
  { icon: '🔧', label: 'Tools' },
  { icon: '⚙️', label: 'Settings' },
  { icon: '🌍', label: 'World' },
  { icon: '📚', label: 'Education' },
  { icon: '🎮', label: 'Gaming' },
  { icon: '🎬', label: 'Movies' },
  { icon: '🛒', label: 'Shopping' },
  { icon: '🏦', label: 'Finance' },
  { icon: '⚕️', label: 'Health' },
  { icon: '🎵', label: 'Music' },
  { icon: '✈️', label: 'Travel' },
  { icon: '🍳', label: 'Food' },
  { icon: '⚽', label: 'Sports' },
  { icon: '🏠', label: 'Home' },
  { icon: '📧', label: 'Email' },
  { icon: '💬', label: 'Social' },
  { icon: '📹', label: 'Video' },
  { icon: '📸', label: 'Photos' },
  { icon: '🎨', label: 'Art' },
  { icon: '📖', label: 'Books' },
];

const MAX_NAME_LENGTH = 30;

export function EditTabModal({ onClose, onUpdate, existingTabs, editTab }: EditTabModalProps) {
  const [name, setName] = useState(editTab.name);
  const [selectedColor, setSelectedColor] = useState<TabColor>(editTab.color);
  const [selectedIcon, setSelectedIcon] = useState(editTab.icon);
  const [nameError, setNameError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'flags' | 'categories'>('flags');
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    return () => modal.removeEventListener("keydown", handleTabKey);
  }, []);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setNameError("Please enter a tab name");
      return;
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      setNameError(`Tab name is too long (max ${MAX_NAME_LENGTH} characters)`);
      return;
    }

    const isDuplicate = existingTabs.some(
      tab => tab.id !== editTab.id && tab.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      setNameError("A tab with this name already exists");
      return;
    }

    onUpdate({
      ...editTab,
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <h2 id="modal-title" className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            Edit Tab
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tab Name
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Technology, Netherlands, English Learning"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 transition-shadow transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              required
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
            />
            <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right">
              {name.length}/{MAX_NAME_LENGTH}
            </span>
            {nameError && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Tab Color
            </label>
            <div className="flex flex-wrap gap-3">
              {TAB_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all ring-2 ring-offset-2 dark:ring-offset-zinc-900",
                    COLOR_CLASSES[color],
                    selectedColor === color ? "ring-2 scale-110" : "ring-transparent hover:scale-105"
                  )}
                  aria-label={`Select ${color} color`}
                  aria-pressed={selectedColor === color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Tab Icon
            </label>
            
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveSection('flags')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  activeSection === 'flags'
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                🏳️ Flags
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('categories')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  activeSection === 'categories'
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                📁 Categories
              </button>
            </div>

            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(activeSection === 'flags' ? FLAG_ICONS : CATEGORY_ICONS).map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all text-lg",
                    selectedIcon === icon
                      ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-110"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105"
                  )}
                  aria-label={`Select ${label} icon`}
                  aria-pressed={selectedIcon === icon}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Preview</h3>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2",
              TAB_COLOR_DETAILS[selectedColor].border,
              TAB_COLOR_DETAILS[selectedColor].light
            )}>
              <span className="text-lg">{selectedIcon}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {name || "Tab Name"}
              </span>
              <span className={cn(
                "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
                TAB_COLOR_DETAILS[selectedColor].bg,
                "text-white"
              )}>
                0
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
