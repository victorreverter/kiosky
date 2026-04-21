import { useState, useCallback } from "react";

interface UseLocalStorageReturn<T> {
  storedValue: T;
  setValue: (value: T | ((val: T) => T)) => void;
  error: string | null;
  clearError: () => void;
}

export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
  const [error, setError] = useState<string | null>(null);
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      try {
        return JSON.parse(item) as T;
      } catch (parseError) {
        console.error(`Failed to parse localStorage item "${key}":`, parseError);
        setError("Stored data was corrupted and has been reset");
        return initialValue;
      }
    } catch (readError) {
      console.error("Error reading localStorage:", readError);
      setError("Failed to read from storage");
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setError(null);
      }
    } catch (writeError) {
      console.error("Error setting localStorage:", writeError);
      if (writeError instanceof Error) {
        if (writeError.name === "QuotaExceededError") {
          setError("Storage quota exceeded. Please remove some items.");
        } else {
          setError("Failed to save to storage");
        }
      }
    }
  }, [key, storedValue]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { storedValue, setValue, error, clearError };
}
