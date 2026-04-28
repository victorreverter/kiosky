import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Loader2, Clock, ChevronDown } from "lucide-react";
import { generateId, isValidHttpUrl, cn } from "../lib/utils";
import type { Source, TabGroup } from "../types";

interface AddSourceModalProps {
  onClose: () => void;
  onAdd?: (source: Source) => void;
  onEdit?: (source: Source) => void;
  existingSources?: Source[];
  editSource?: Source | null;
  tabGroups?: TabGroup[];
  activeTabId?: string;
}

const MAX_NAME_LENGTH = 50;
const MAX_URL_LENGTH = 500;
const RATE_LIMIT_COOLDOWN = 2000;

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname;
    const search = parsed.search;
    return `https://${hostname}${pathname}${search}`;
  } catch {
    return url.toLowerCase();
  }
}

export function AddSourceModal({ onClose, onAdd, onEdit, existingSources = [], editSource = null, tabGroups = [], activeTabId = "uncategorized" }: AddSourceModalProps) {
  const [name, setName] = useState(editSource?.name ?? "");
  const [url, setUrl] = useState(editSource?.url ?? "");
  const [selectedTabId, setSelectedTabId] = useState(editSource?.tabId ?? activeTabId);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  const timeSinceLastSubmission = currentTime - lastSubmissionTime;
  const isRateLimited = timeSinceLastSubmission < RATE_LIMIT_COOLDOWN;
  const remainingCooldown = Math.max(0, RATE_LIMIT_COOLDOWN - timeSinceLastSubmission);

  // Update current time to trigger re-render for countdown
  useEffect(() => {
    if (isRateLimited) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRateLimited]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Focus trap: keep tab navigation within modal
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

  // Focus first input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(e.target as Node)) {
        setShowTabDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    if (name.trim().length > MAX_NAME_LENGTH) {
      setUrlError("Site name is too long");
      return;
    }

    if (url.trim().length > MAX_URL_LENGTH) {
      setUrlError("URL is too long");
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    if (!isValidHttpUrl(finalUrl)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    if (dangerousProtocols.some(protocol => finalUrl.toLowerCase().includes(protocol))) {
      setUrlError("This URL contains unsafe protocols");
      return;
    }

    const normalizedUrl = normalizeUrl(finalUrl);
    const isDuplicate = existingSources.some(
      source => source.id !== editSource?.id && normalizeUrl(source.url) === normalizedUrl
    );

    if (isDuplicate) {
      setUrlError("This source has already been added");
      return;
    }

    if (isRateLimited) {
      setUrlError(`Please wait ${Math.ceil(remainingCooldown / 1000)}s before adding another source`);
      return;
    }

    setIsSubmitting(true);
    setUrlError(null);
    setLastSubmissionTime(Date.now());
    
    if (editSource && onEdit) {
      onEdit({
        ...editSource,
        name: name.trim(),
        url: finalUrl,
        tabId: selectedTabId,
      });
    } else if (onAdd) {
      onAdd({
        id: generateId(),
        name: name.trim(),
        url: finalUrl,
        addedAt: Date.now(),
        tabId: selectedTabId,
      });
    }
    
    setIsSubmitting(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_URL_LENGTH) {
      setUrl(value);
      if (urlError) {
        setUrlError(null);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value);
    }
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
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 id="modal-title" className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            {editSource ? "Edit Source" : "Add New Source"}
          </h2>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Site Name
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Hacker News"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 transition-shadow transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              required
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
            />
            <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right">
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              URL
            </label>
            <input
              id="url"
              type="url"
              inputMode="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="e.g. https://news.ycombinator.com"
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 transition-shadow transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                urlError 
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500/50" 
                  : "border-zinc-200 dark:border-zinc-800"
              )}
              required
              autoComplete="off"
              aria-invalid={urlError ? "true" : "false"}
              aria-describedby={urlError ? "url-error" : undefined}
              maxLength={MAX_URL_LENGTH}
            />
            <span className="block mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-right">
              {url.length}/{MAX_URL_LENGTH}
            </span>
            {urlError && (
              <div id="url-error" className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {tabGroups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tab
              </label>
              <div className="relative" ref={tabDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTabDropdown(!showTabDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-100 transition-shadow transition-colors flex items-center justify-between"
                  aria-haspopup="listbox"
                  aria-expanded={showTabDropdown}
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const tab = [...tabGroups].find(t => t.id === selectedTabId);
                      if (tab) {
                        return (
                          <>
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.name}</span>
                          </>
                        );
                      }
                      return <span>Uncategorized</span>;
                    })()}
                  </span>
                  <ChevronDown size={16} className={cn("text-zinc-400 transition-transform", showTabDropdown && "rotate-180")} />
                </button>

                {showTabDropdown && (
                  <div
                    className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                    role="listbox"
                  >
                    {tabGroups.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSelectedTabId(tab.id);
                          setShowTabDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors",
                          selectedTabId === tab.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        )}
                        role="option"
                        aria-selected={selectedTabId === tab.id}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{tab.name}</span>
                        {selectedTabId === tab.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              disabled={isSubmitting || isRateLimited}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !url.trim() || isSubmitting || isRateLimited}
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{editSource ? "Saving..." : "Adding..."}</span>
                </>
              ) : isRateLimited ? (
                <>
                  <Clock className="animate-pulse" size={16} />
                  <span>Wait {Math.ceil(remainingCooldown / 1000)}s</span>
                </>
              ) : (
                <span>{editSource ? "Save Changes" : "Add Source"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
