import { useRef, useState } from "react";
import { X, Download, Upload, AlertCircle } from "lucide-react";
import { exportSources, importSources, downloadExportFile, parseImportFile, type ExportData } from "../lib/importExport";
import type { Source, TabGroup } from "../types";

interface ImportExportModalProps {
  onClose: () => void;
  sources: Source[];
  tabGroups?: TabGroup[];
  onImport: (sources: Source[], tabGroups?: TabGroup[]) => void;
}

export function ImportExportModal({ onClose, sources, tabGroups, onImport }: ImportExportModalProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportSources(sources, tabGroups);
    downloadExportFile(data);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseImportFile(file);
      const result = importSources(data as ExportData);
      
      if (result.sources.length === 0) {
        setImportError("No valid sources found in file");
      } else {
        setImportError(null);
        onImport(result.sources, result.tabGroups);
        onClose();
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import file");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 id="modal-title" className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            Import / Export
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              type="button"
            >
              <Download size={20} />
              <span>Export Sources</span>
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Download all your sources as a JSON file
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-medium transition-colors"
              type="button"
            >
              <Upload size={20} />
              <span>Import Sources</span>
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Import sources from a JSON file
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />

          {importError && (
            <div 
              className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="text-red-600 dark:text-red-500 shrink-0" size={20} />
              <div>
                <p className="text-sm text-red-700 dark:text-red-600/90">{importError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
