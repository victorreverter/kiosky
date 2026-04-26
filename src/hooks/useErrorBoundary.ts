import { useState, useCallback, useEffect } from "react";

interface UseErrorBoundaryReturn {
  hasError: boolean;
  error: Error | null;
  showError: (error: Error) => void;
  clearError: () => void;
  reset: () => void;
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const showError = useCallback((error: Error) => {
    console.error("Error boundary hook caught:", error);
    setError(error);
    setHasError(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  // Log errors to console in development
  useEffect(() => {
    if (error) {
      console.error("Development error log:", error);
    }
  }, [error]);

  return {
    hasError,
    error,
    showError,
    clearError,
    reset,
  };
}
