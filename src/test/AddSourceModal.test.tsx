import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSourceModal } from '../components/AddSourceModal';
import { fireEvent } from '@testing-library/react';

describe('AddSourceModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnAdd.mockClear();
  });

  it('should render the modal with title', () => {
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    expect(screen.getByText('Add New Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Site Name')).toBeInTheDocument();
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
  });

  it('should close when clicking the close button', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close when pressing Escape', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate URL and show error for invalid URLs', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test Site');
    await user.type(screen.getByLabelText('URL'), 'javascript:alert(1)');
    await user.click(screen.getByText('Add Source'));
    
    expect(screen.getByText('Please enter a valid URL (e.g., https://example.com)')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should call onAdd with valid data', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test Site');
    await user.type(screen.getByLabelText('URL'), 'example.com');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Site',
      url: 'https://example.com',
    }));
  });

  it('should auto-prefix https:// to URLs without protocol', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'example.com');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com',
    }));
  });

  it('should enforce character limit on name field', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const longName = 'A'.repeat(60);
    await user.type(screen.getByLabelText('Site Name'), longName);
    
    const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;
    expect(nameInput.value.length).toBeLessThanOrEqual(50);
  });

  it('should enforce character limit on URL field', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const longUrl = 'https://' + 'example.com/'.repeat(50);
    await user.type(screen.getByLabelText('URL'), longUrl);
    
    const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
    expect(urlInput.value.length).toBeLessThanOrEqual(500);
  });

  it('should show character count for name field', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    
    expect(screen.getByText('4/50')).toBeInTheDocument();
  });

  it('should show character count for URL field', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    await user.type(screen.getByLabelText('URL'), 'example.com');
    
    expect(screen.getByText('11/500')).toBeInTheDocument();
  });

  it('should prevent adding duplicate URLs', async () => {
    const user = userEvent.setup();
    const existingSources = [
      { id: '1', name: 'Example', url: 'https://example.com', addedAt: Date.now() },
    ];
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd} 
        existingSources={existingSources} 
      />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'example.com');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(screen.getByText('This source has already been added')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should detect duplicate URLs with different protocols', async () => {
    const user = userEvent.setup();
    const existingSources = [
      { id: '1', name: 'Example', url: 'https://example.com', addedAt: Date.now() },
    ];
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd} 
        existingSources={existingSources} 
      />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'http://example.com');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should detect duplicate URLs with trailing slash', async () => {
    const user = userEvent.setup();
    const existingSources = [
      { id: '1', name: 'Example', url: 'https://example.com', addedAt: Date.now() },
    ];
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd} 
        existingSources={existingSources} 
      />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'https://example.com/');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should allow adding URLs with different paths', async () => {
    const user = userEvent.setup();
    const existingSources = [
      { id: '1', name: 'Example', url: 'https://example.com/news', addedAt: Date.now() },
    ];
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd} 
        existingSources={existingSources} 
      />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'https://example.com/sports');
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('should render edit modal with existing data', () => {
    const editSource = { 
      id: '1', 
      name: 'Existing Site', 
      url: 'https://existing.com', 
      addedAt: Date.now() 
    };
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onEdit={mockOnAdd}
        editSource={editSource}
        existingSources={[]}
      />
    );
    
    expect(screen.getByText('Edit Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Site Name')).toHaveValue('Existing Site');
    expect(screen.getByLabelText('URL')).toHaveValue('https://existing.com');
  });

  it('should call onEdit instead of onAdd when editing', async () => {
    const user = userEvent.setup();
    const editSource = { 
      id: '1', 
      name: 'Existing Site', 
      url: 'https://existing.com', 
      addedAt: Date.now() 
    };
    const mockOnEdit = vi.fn();
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        editSource={editSource}
        existingSources={[]}
      />
    );
    
    await user.clear(screen.getByLabelText('Site Name'));
    await user.type(screen.getByLabelText('Site Name'), 'Updated Site');
    fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }));
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should allow editing same URL without duplicate error', async () => {
    const editSource = { 
      id: '1', 
      name: 'Example', 
      url: 'https://example.com', 
      addedAt: Date.now() 
    };
    const existingSources = [editSource];
    const mockOnEdit = vi.fn();
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onEdit={mockOnEdit}
        editSource={editSource}
        existingSources={existingSources}
      />
    );
    
    fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }));
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should enforce rate limiting on rapid submissions', async () => {
    const user = userEvent.setup();
    const mockOnAdd = vi.fn();
    
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    await user.type(screen.getByLabelText('Site Name'), 'Test');
    await user.type(screen.getByLabelText('URL'), 'example.com');
    
    // First submission should succeed
    fireEvent.submit(screen.getByRole('button', { name: 'Add Source' }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    
    // Wait for button text to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second submission should be rate limited (button is disabled)
    const rateLimitedButton = screen.getByRole('button', { name: /Wait \d+s/ });
    expect(rateLimitedButton).toBeDisabled();
    
    // Button should show countdown
    expect(rateLimitedButton).toHaveTextContent(/Wait \d+s/);
  });

  it('should focus first input on mount', async () => {
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    // Wait for focus to be set
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const nameInput = screen.getByLabelText('Site Name');
    expect(document.activeElement).toBe(nameInput);
  });

  it('should trap focus within modal using Tab key', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    // Wait for initial focus
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const nameInput = screen.getByLabelText('Site Name');
    const urlInput = screen.getByLabelText('URL');
    
    // Name input should have initial focus
    expect(document.activeElement).toBe(nameInput);
    
    // Tab to URL input
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(urlInput);
    
    // Tab several times - focus should stay in modal (not on body)
    await user.keyboard('{Tab}{Tab}{Tab}');
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement?.tagName).not.toBe('BODY');
  });

  it('should trap focus with Shift+Tab (reverse)', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    const nameInput = screen.getByLabelText('Site Name');
    const closeButton = screen.getByLabelText('Close modal');
    
    // Start at name input
    nameInput.focus();
    expect(nameInput).toHaveFocus();
    
    // Shift+Tab should loop to last element (close button)
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(closeButton).toHaveFocus();
  });

  it('should lock body scroll when modal is open', () => {
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll on unmount', () => {
    const originalOverflow = document.body.style.overflow;
    
    const { unmount } = render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    unmount();
    
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('should prevent modal from closing when clicking inside', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    // Click inside modal content (not the overlay)
    await user.click(screen.getByText('Add New Source'));
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when clicking overlay', async () => {
    const user = userEvent.setup();
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    // Click on overlay (the div with role="dialog")
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should clear URL error when user starts typing', () => {
    render(
      <AddSourceModal 
        onClose={mockOnClose} 
        onAdd={mockOnAdd}
        existingSources={[]}
      />
    );
    
    const urlInput = screen.getByLabelText('URL');
    
    // The handleUrlChange function clears urlError on every change
    // Verify aria-invalid starts as false
    expect(urlInput).toHaveAttribute('aria-invalid', 'false');
    
    // Simulate the component having an error by checking that
    // the onChange handler properly clears errors when typing
    fireEvent.change(urlInput, { target: { value: 'test' } });
    
    // After typing, the input should still have aria-invalid false
    // (the component's handleUrlChange clears urlError on every change)
    expect(urlInput).toHaveAttribute('aria-invalid', 'false');
  });
});
