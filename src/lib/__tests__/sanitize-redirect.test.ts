import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from '../sanitize-redirect';

describe('sanitizeRedirectPath', () => {
  it('allows internal relative paths', () => {
    expect(sanitizeRedirectPath('/home')).toBe('/home');
    expect(sanitizeRedirectPath('/map?tab=visited')).toBe('/map?tab=visited');
  });

  it('rejects external URLs and protocol-relative paths', () => {
    expect(sanitizeRedirectPath('https://evil.com')).toBe('/home');
    expect(sanitizeRedirectPath('//evil.com/path')).toBe('/home');
    expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/home');
  });

  it('falls back for empty values', () => {
    expect(sanitizeRedirectPath(null)).toBe('/home');
    expect(sanitizeRedirectPath('')).toBe('/home');
    expect(sanitizeRedirectPath('   ')).toBe('/home');
  });
});
