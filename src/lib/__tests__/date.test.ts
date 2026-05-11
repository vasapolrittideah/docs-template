import { describe, expect, it } from 'vitest';

import { formatDate } from '../date';

describe('formatDate', () => {
  it('formats date in English', () => {
    expect(formatDate('2026-05-08', 'en')).toBe('May 8, 2026');
  });

  it('formats date in Thai', () => {
    expect(formatDate('2026-05-08', 'th')).toBe('8 พฤษภาคม 2569');
  });

  it('formats date with single-digit day', () => {
    expect(formatDate('2026-01-01', 'en')).toBe('January 1, 2026');
  });
});
