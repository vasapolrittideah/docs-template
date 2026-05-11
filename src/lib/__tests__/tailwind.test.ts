import { describe, expect, it } from 'vitest';
import { cn, twMergeConfig } from '../tailwind';

describe('twMergeConfig', () => {
  it('contains font-size class group with typography patterns', () => {
    const patterns = twMergeConfig.extend.classGroups['font-size'][0].text;
    expect(patterns).toContain('title-h1');
    expect(patterns).toContain('label-xl');
    expect(patterns).toContain('paragraph-md');
    expect(patterns).toContain('subheading-2xs');
    expect(patterns).toContain('doc-label');
    expect(patterns).toContain('doc-paragraph');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', undefined, false, null, '', 'bar')).toBe('foo bar');
  });

  it('merges conflicting Tailwind classes — last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('merges conflicting text-size classes', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('treats custom typography classes as font-size group — deduplicates', () => {
    expect(cn('text-title-h1', 'text-label-xl')).toBe('text-label-xl');
  });

  it('handles conditional classes via object syntax from clsx', () => {
    expect(cn({ 'bg-red-500': true, 'bg-blue-500': false })).toBe('bg-red-500');
  });

  it('returns empty string when no classes provided', () => {
    expect(cn()).toBe('');
  });
});
