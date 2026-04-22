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
});
