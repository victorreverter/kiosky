import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return initial value when key does not exist', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.storedValue).toBe('initial');
    });

    it('should return stored value when key exists', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.storedValue).toBe('stored-value');
    });

    it('should set value in localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current.setValue('new-value');
      });
      
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
      expect(result.current.storedValue).toBe('new-value');
    });

    it('should update value using function', () => {
      localStorage.setItem('test-key', JSON.stringify(5));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      
      act(() => {
        result.current.setValue(prev => prev + 10);
      });
      
      expect(result.current.storedValue).toBe(15);
    });
  });

  describe('Storage errors - Read errors', () => {
    it('should handle localStorage read errors', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.error).toBe('Failed to read from storage');
      expect(result.current.storedValue).toBe('initial');

      getItemSpy.mockRestore();
    });

    it('should handle JSON parse errors (corrupted data)', () => {
      localStorage.setItem('test-key', 'invalid-json{corrupted');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
      
      expect(result.current.error).toBe('Stored data was corrupted and has been reset');
      expect(result.current.storedValue).toBe('fallback');
    });

    it('should clear error when setting new value', () => {
      localStorage.setItem('test-key', 'invalid-json');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
      expect(result.current.error).toBe('Stored data was corrupted and has been reset');
      
      act(() => {
        result.current.setValue('new-valid-value');
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Storage errors - Write errors', () => {
    it('should handle quota exceeded errors', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      act(() => {
        result.current.setValue('new-value');
      });
      
      expect(result.current.error).toBe('Storage quota exceeded. Please remove some items.');

      setItemSpy.mockRestore();
    });

    it('should handle generic write errors', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Write permission denied');
      });

      act(() => {
        result.current.setValue('new-value');
      });
      
      expect(result.current.error).toBe('Failed to save to storage');

      setItemSpy.mockRestore();
    });
  });

  describe('Loading state', () => {
    it('should set isLoading to false after reading from storage', () => {
      localStorage.setItem('test-key', JSON.stringify('value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading to false when key does not exist', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values in localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify(null));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current.storedValue).toBe(null);
    });

    it('should handle complex objects', () => {
      const complexObject = { 
        id: 1, 
        name: 'Test', 
        nested: { value: 'data' },
        array: [1, 2, 3]
      };
      
      const { result } = renderHook(() => useLocalStorage('complex-key', complexObject));
      
      expect(result.current.storedValue).toEqual(complexObject);
    });

    it('should handle empty strings', () => {
      localStorage.setItem('test-key', JSON.stringify(''));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current.storedValue).toBe('');
    });

    it('should handle arrays', () => {
      localStorage.setItem('test-key', JSON.stringify([1, 2, 3]));
      
      const { result } = renderHook(() => useLocalStorage('test-key', []));
      
      expect(result.current.storedValue).toEqual([1, 2, 3]);
    });

    it('should handle numbers', () => {
      localStorage.setItem('test-key', JSON.stringify(42));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      
      expect(result.current.storedValue).toBe(42);
    });

    it('should handle booleans', () => {
      localStorage.setItem('test-key', JSON.stringify(true));
      
      const { result } = renderHook(() => useLocalStorage('test-key', false));
      
      expect(result.current.storedValue).toBe(true);
    });
  });

  describe('clearError function', () => {
    it('should clear error state', () => {
      localStorage.setItem('test-key', 'invalid-json');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
      expect(result.current.error).toBe('Stored data was corrupted and has been reset');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should do nothing when no error exists', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      expect(result.current.error).toBeNull();
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Multiple hooks instances', () => {
    it('should handle multiple instances with different keys', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));
      
      expect(result1.current.storedValue).toBe('value1');
      expect(result2.current.storedValue).toBe('value2');
      
      act(() => {
        result1.current.setValue('updated1');
        result2.current.setValue('updated2');
      });
      
      expect(result1.current.storedValue).toBe('updated1');
      expect(result2.current.storedValue).toBe('updated2');
    });
  });
});
