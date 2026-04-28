import { Source, TabGroup } from "../types";

export interface ExportData {
  version: string;
  exportedAt: number;
  sources: Source[];
  tabGroups?: TabGroup[];
}

export function exportSources(sources: Source[], tabGroups?: TabGroup[]): ExportData {
  return {
    version: "2.0",
    exportedAt: Date.now(),
    sources,
    ...(tabGroups ? { tabGroups } : {}),
  };
}

export function importSources(data: ExportData): { sources: Source[]; tabGroups?: TabGroup[] } {
  if (!data || !Array.isArray(data.sources)) {
    throw new Error("Invalid import data format");
  }

  const sources = data.sources.filter((source) => {
    return (
      typeof source.id === "string" &&
      typeof source.name === "string" &&
      typeof source.url === "string" &&
      typeof source.addedAt === "number"
    );
  }).map(source => ({
    ...source,
    tabId: source.tabId || "uncategorized",
  }));

  const tabGroups = data.tabGroups?.filter((tab) => {
    return (
      typeof tab.id === "string" &&
      typeof tab.name === "string" &&
      typeof tab.color === "string" &&
      typeof tab.icon === "string" &&
      typeof tab.createdAt === "number"
    );
  });

  return { sources, tabGroups };
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
