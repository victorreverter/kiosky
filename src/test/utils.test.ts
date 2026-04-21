import { describe, it, expect } from 'vitest';
import { isValidHttpUrl, generateId, getFaviconUrl } from '../lib/utils';

describe('isValidHttpUrl', () => {
  it('should return true for valid HTTP URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('http://www.example.com/path')).toBe(true);
  });

  it('should return true for valid HTTPS URLs', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('https://www.example.com/path?query=1')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,<h1>Test</h1>')).toBe(false);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
  });

  it('should return false for malformed URLs', () => {
    expect(isValidHttpUrl('not-a-url')).toBe(false);
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl('ht tp://example.com')).toBe(false);
  });
});

describe('generateId', () => {
  it('should generate a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('getFaviconUrl', () => {
  it('should return a valid favicon URL for valid inputs', () => {
    const result = getFaviconUrl('https://example.com');
    expect(result).toContain('google.com/s2/favicons');
    expect(result).toContain('domain=example.com');
  });

  it('should return null for invalid URLs', () => {
    expect(getFaviconUrl('not-a-url')).toBe(null);
    expect(getFaviconUrl('')).toBe(null);
  });
});
