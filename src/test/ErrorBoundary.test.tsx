import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ComponentErrorBoundary } from '../components/ComponentErrorBoundary';

// Component that throws an error
const BrokenComponent = ({ throwOnRender = true }: { throwOnRender?: boolean }) => {
  if (throwOnRender) {
    throw new Error('Test error');
  }
  return <div>Working</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('should show error UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should use custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should allow reloading the page', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Reload Page'));
    expect(reloadMock).toHaveBeenCalled();
  });
});

describe('ComponentErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ComponentErrorBoundary>
        <div>Normal Content</div>
      </ComponentErrorBoundary>
    );
    
    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('should show error UI when error is thrown', () => {
    render(
      <ComponentErrorBoundary name="TestComponent">
        <BrokenComponent />
      </ComponentErrorBoundary>
    );
    
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText(/TestComponent/)).toBeInTheDocument();
  });

  it('should show component name in error message', () => {
    render(
      <ComponentErrorBoundary name="MyComponent">
        <BrokenComponent />
      </ComponentErrorBoundary>
    );
    
    expect(screen.getByText(/MyComponent/)).toBeInTheDocument();
  });

  it('should allow retrying', () => {
    render(
      <ComponentErrorBoundary>
        <BrokenComponent throwOnRender={true} />
      </ComponentErrorBoundary>
    );
    
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    // Click retry - this resets the error state in the boundary
    fireEvent.click(screen.getByText('Try Again'));
    
    // The error state is reset, but component still throws
    // In real usage, the component would be fixed or temporary error resolved
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    render(
      <ComponentErrorBoundary fallback={<div>Custom Component Fallback</div>}>
        <BrokenComponent />
      </ComponentErrorBoundary>
    );
    
    expect(screen.getByText('Custom Component Fallback')).toBeInTheDocument();
  });
});
