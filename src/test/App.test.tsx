import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Search/Filter Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display search input', () => {
    render(<App />);
    expect(screen.getByLabelText('Search sources')).toBeInTheDocument();
  });

  it('should filter sources by name', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'Hacker');
    
    expect(screen.getByText('Hacker News')).toBeInTheDocument();
    expect(screen.queryByText('NY Times')).not.toBeInTheDocument();
  });

  it('should filter sources by URL', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'ycombinator');
    
    expect(screen.getByText('Hacker News')).toBeInTheDocument();
    expect(screen.queryByText('NY Times')).not.toBeInTheDocument();
  });

  it('should be case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'NEWS');
    
    expect(screen.getByText('Hacker News')).toBeInTheDocument();
  });

  it('should show all sources when search is empty', () => {
    render(<App />);
    
    expect(screen.getByText('NY Times')).toBeInTheDocument();
    expect(screen.getByText('The Verge')).toBeInTheDocument();
    expect(screen.getByText('Hacker News')).toBeInTheDocument();
    expect(screen.getByText('TechCrunch')).toBeInTheDocument();
  });

  it('should show empty state when no matches found', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'xyz123nonexistent');
    
    expect(screen.getByText('No sources found matching "xyz123nonexistent"')).toBeInTheDocument();
    expect(screen.getByText('Clear search')).toBeInTheDocument();
  });

  it('should clear search on clear button click', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'Hacker');
    
    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(screen.getByText('NY Times')).toBeInTheDocument();
  });

  it('should show results count', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    expect(screen.getByText('4 of 4 sources')).toBeInTheDocument();
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'Hacker');
    
    expect(screen.getByText('1 of 4 sources matching "Hacker"')).toBeInTheDocument();
  });

  it('should focus search on / key press', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await user.keyboard('/');
    
    expect(screen.getByLabelText('Search sources')).toHaveFocus();
  });

  it('should clear search on Escape key press', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'Hacker');
    await user.keyboard('{Escape}');
    
    expect(searchInput).toHaveValue('');
  });

  it('should trim whitespace from search query', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, '   ');
    
    expect(screen.getByText(/4 of 4 sources/)).toBeInTheDocument();
  });

  it('should update results count as user types', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'News');
    
    expect(screen.getByText(/1 of 4 sources matching "News"/)).toBeInTheDocument();
  });

  it('should handle special characters in search', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByLabelText('Search sources');
    await user.type(searchInput, 'https://');
    
    expect(screen.getByText(/matching "https:"/)).toBeInTheDocument();
  });
});
