import { exportSources, importSources, parseImportFile } from '../lib/importExport';
import type { Source } from '../types';
import type { ExportData } from '../lib/importExport';

describe('importExport', () => {
  const mockSources: Source[] = [
    { id: '1', name: 'Test Site', url: 'https://example.com', addedAt: 1234567890, tabId: 'uncategorized' },
    { id: '2', name: 'Another Site', url: 'https://another.com', addedAt: 1234567891, tabId: 'uncategorized' },
  ];

  describe('exportSources', () => {
    it('should export sources with metadata', () => {
      const result = exportSources(mockSources);
      
      expect(result.version).toBe('2.0');
      expect(result.exportedAt).toBeGreaterThan(0);
      expect(result.sources).toEqual(mockSources);
    });

    it('should handle empty sources array', () => {
      const result = exportSources([]);
      
      expect(result.version).toBe('2.0');
      expect(result.sources).toEqual([]);
    });
  });

  describe('importSources', () => {
    it('should import valid sources', () => {
      const exportData = {
        version: '2.0',
        exportedAt: Date.now(),
        sources: mockSources,
      };
      
      const result = importSources(exportData);
      
      expect(result.sources).toEqual(mockSources);
    });

    it('should filter out invalid sources', () => {
      const exportData = {
        version: '2.0',
        exportedAt: Date.now(),
        sources: [
          { id: '1', name: 'Valid', url: 'https://valid.com', addedAt: 123, tabId: 'uncategorized' },
          { id: '2', url: 'https://invalid.com', addedAt: 123, tabId: 'uncategorized' }, // missing name
          { id: '3', name: 'Valid2', url: 'https://valid2.com', addedAt: 456, tabId: 'uncategorized' },
        ],
      };
      
      const result = importSources(exportData as ExportData);
      
      expect(result.sources).toHaveLength(2);
      expect(result.sources[0].id).toBe('1');
      expect(result.sources[1].id).toBe('3');
    });

    it('should throw error for invalid data format', () => {
      expect(() => importSources({} as ExportData)).toThrow('Invalid import data format');
      expect(() => importSources({ sources: 'not-array' } as unknown as ExportData)).toThrow('Invalid import data format');
    });

    it('should return empty array for sources with no valid entries', () => {
      const exportData = {
        version: '1.0',
        exportedAt: Date.now(),
        sources: [
          { id: 'invalid', name: null, url: 'invalid', addedAt: 'not-number', tabId: 'uncategorized' },
        ],
      };
      
      const result = importSources(exportData as unknown as ExportData);
      
      expect(result.sources).toEqual([]);
    });
  });
});

describe('parseImportFile', () => {
  it('should parse valid JSON file', async () => {
    const jsonData = {
      version: '1.0',
      exportedAt: Date.now(),
      sources: [{ id: '1', name: 'Test', url: 'https://test.com', addedAt: 123 }],
    };
    
    const file = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const testFile = new File([file], 'test.json', { type: 'application/json' });
    
    const result = await parseImportFile(testFile);
    
    expect(result).toEqual(jsonData);
  });

  it('should reject invalid JSON', async () => {
    const file = new Blob(['not valid json'], { type: 'application/json' });
    const testFile = new File([file], 'invalid.json', { type: 'application/json' });
    
    await expect(parseImportFile(testFile)).rejects.toThrow('Invalid JSON file');
  });

  it('should reject on file read error', async () => {
    const file = new Blob([], { type: 'application/json' });
    const testFile = new File([file], 'empty.json', { type: 'application/json' });
    
    Object.defineProperty(testFile, 'arrayBuffer', {
      value: () => Promise.reject(new Error('Read error')),
      writable: true,
    });
    
    await expect(parseImportFile(testFile)).rejects.toThrow();
  });
});
