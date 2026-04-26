import { Source } from "../types";

export interface ExportData {
  version: string;
  exportedAt: number;
  sources: Source[];
}

export function exportSources(sources: Source[]): ExportData {
  return {
    version: "1.0",
    exportedAt: Date.now(),
    sources,
  };
}

export function importSources(data: ExportData): Source[] {
  if (!data || !Array.isArray(data.sources)) {
    throw new Error("Invalid import data format");
  }

  return data.sources.filter((source) => {
    return (
      typeof source.id === "string" &&
      typeof source.name === "string" &&
      typeof source.url === "string" &&
      typeof source.addedAt === "number"
    );
  });
}

export function downloadExportFile(data: ExportData, filename: string = "kiosky-sources.json"): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
