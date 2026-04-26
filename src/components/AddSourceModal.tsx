import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { generateId, isValidHttpUrl, cn } from "../lib/utils";
import type { Source } from "../types";

interface AddSourceModalProps {
  onClose: () => void;
  onAdd?: (source: Source) => void;
  onEdit?: (source: Source) => void;
  existingSources?: Source[];
  editSource?: Source | null;
}

const MAX_NAME_LENGTH = 50;
const MAX_URL_LENGTH = 500;

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

export function AddSourceModal({ onClose, onAdd, onEdit, existingSources = [], editSource = null }: AddSourceModalProps) {
  const [name, setName] = useState(editSource?.name ?? "");
  const [url, setUrl] = useState(editSource?.url ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

    setIsSubmitting(true);
    setUrlError(null);
    
    if (editSource && onEdit) {
      onEdit({
        ...editSource,
        name: name.trim(),
        url: finalUrl,
      });
    } else if (onAdd) {
      onAdd({
        id: generateId(),
        name: name.trim(),
        url: finalUrl,
        addedAt: Date.now(),
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

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !url.trim() || isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{editSource ? "Saving..." : "Adding..."}</span>
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
