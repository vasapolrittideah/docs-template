import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSearchSnippet } from '../search';

const CONTEXT = 32; // default contextLength

// Build a text of `n` 'x' characters so positions are easy to reason about
const repeat = (char: string, n: number) => char.repeat(n);

// ---------------------------------------------------------------------------
// getSearchSnippet — no indices (empty match)
// ---------------------------------------------------------------------------
describe('getSearchSnippet — no indices', () => {
  it('returns the first 2*contextLength characters', () => {
    const text = repeat('a', 100);
    const result = getSearchSnippet(text, []);
    expect(result.snippet).toBe(text.slice(0, CONTEXT * 2));
  });

  it('sets offset and matchLength to 0', () => {
    const result = getSearchSnippet('hello world', []);
    expect(result.offset).toBe(0);
    expect(result.matchLength).toBe(0);
  });

  it('sets hasLeading to false', () => {
    expect(getSearchSnippet('hello', []).hasLeading).toBe(false);
  });

  it('sets hasTrailing true when text is longer than 2*contextLength', () => {
    const text = repeat('a', CONTEXT * 2 + 1);
    expect(getSearchSnippet(text, []).hasTrailing).toBe(true);
  });

  it('sets hasTrailing false when text fits within 2*contextLength', () => {
    const text = repeat('a', CONTEXT * 2);
    expect(getSearchSnippet(text, []).hasTrailing).toBe(false);
  });

  it('respects a custom contextLength', () => {
    const text = repeat('a', 20);
    const result = getSearchSnippet(text, [], 5);
    expect(result.snippet).toBe(text.slice(0, 10));
  });
});

// ---------------------------------------------------------------------------
// getSearchSnippet — with indices
// ---------------------------------------------------------------------------
describe('getSearchSnippet — with indices', () => {
  it('picks the longest match when multiple indices are given', () => {
    // Short match [0,1] vs long match [10,20]
    const text = repeat('a', 100);
    const result = getSearchSnippet(text, [
      [0, 1],
      [10, 20],
    ]);
    // Longest match starts at 10, matchLength = 20-10+1 = 11
    expect(result.matchLength).toBe(11);
  });

  it('computes matchLength correctly for a single-char match', () => {
    const text = 'hello world';
    const result = getSearchSnippet(text, [[6, 6]]);
    expect(result.matchLength).toBe(1);
  });

  it('computes matchLength correctly for a multi-char match', () => {
    const text = 'hello world';
    // "world" = [6,10]
    const result = getSearchSnippet(text, [[6, 10]]);
    expect(result.matchLength).toBe(5);
  });

  it('offset equals start minus snippetStart', () => {
    // Match at [50, 55] in a 200-char text — context window does not hit the start
    const text = repeat('a', 200);
    const result = getSearchSnippet(text, [[50, 55]]);
    const expectedSnippetStart = 50 - CONTEXT; // = 18
    expect(result.offset).toBe(50 - expectedSnippetStart);
  });

  it('sets hasLeading false when match is near the start', () => {
    const text = repeat('a', 100);
    const result = getSearchSnippet(text, [[0, 5]]);
    expect(result.hasLeading).toBe(false);
  });

  it('sets hasLeading true when match is far from the start', () => {
    const text = repeat('a', 200);
    const result = getSearchSnippet(text, [[100, 105]]);
    expect(result.hasLeading).toBe(true);
  });

  it('sets hasTrailing false when match is near the end', () => {
    const text = repeat('a', 50);
    const result = getSearchSnippet(text, [[45, 49]]);
    expect(result.hasTrailing).toBe(false);
  });

  it('sets hasTrailing true when match is far from the end', () => {
    const text = repeat('a', 200);
    const result = getSearchSnippet(text, [[0, 5]]);
    expect(result.hasTrailing).toBe(true);
  });

  it('clamps snippetStart to 0 when context extends before the text', () => {
    const text = 'short text here';
    // Match at [1, 3] — contextLength=32 would give snippetStart = 1-32 = -31
    const result = getSearchSnippet(text, [[1, 3]]);
    expect(result.hasLeading).toBe(false);
    expect(result.snippet.startsWith('short')).toBe(true);
  });

  it('clamps snippetEnd to text.length when context extends past the text', () => {
    const text = 'short text here';
    const lastIdx = text.length - 1;
    const result = getSearchSnippet(text, [[lastIdx - 2, lastIdx]]);
    expect(result.hasTrailing).toBe(false);
    expect(result.snippet.endsWith('here')).toBe(true);
  });

  it('redistributes context window when snippetStart < 0', () => {
    // Match at [2, 4] with contextLength=10 → snippetStart = 2-10 = -8
    // Should redistribute: snippetEnd += 8, snippetStart = 0
    const text = repeat('a', 50);
    const result = getSearchSnippet(text, [[2, 4]], 10);
    expect(result.hasLeading).toBe(false);
    // snippet should be longer on the right side (redistributed)
    expect(result.snippet.length).toBe(Math.min(50, 4 + 10 + 1 + 8));
  });

  it('returns the actual matched text within the snippet at the correct offset', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    // "fox" is at index 16..18
    const result = getSearchSnippet(text, [[16, 18]]);
    const matchedInSnippet = result.snippet.slice(result.offset, result.offset + result.matchLength);
    expect(matchedInSnippet).toBe('fox');
  });
});

// ---------------------------------------------------------------------------
// getSearchIndex
// ---------------------------------------------------------------------------

const mockHeadings = [{ id: 'intro', title: 'Introduction', href: '/en/docs/intro' }];
const mockContents = [{ id: 'intro', content: 'Hello world', href: '/en/docs/intro' }];

// Module-level mock vars so they can be changed per-test before re-import
let mockReadFileSync: ReturnType<typeof vi.fn>;

vi.mock('fs', () => ({
  default: {
    get readFileSync() {
      return mockReadFileSync;
    },
  },
  get readFileSync() {
    return mockReadFileSync;
  },
}));

describe('getSearchIndex', () => {
  beforeEach(() => {
    mockReadFileSync = vi.fn();
    vi.resetModules();
  });

  it('reads from disk on the server (window === undefined)', async () => {
    vi.stubGlobal('window', undefined);
    mockReadFileSync
      .mockReturnValueOnce(JSON.stringify(mockHeadings))
      .mockReturnValueOnce(JSON.stringify(mockContents));

    const { getSearchIndex } = await import('../search');
    const index = await getSearchIndex('en');

    expect(index.headings).toEqual(mockHeadings);
    expect(index.contents).toEqual(mockContents);
    expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it('caches the result and does not re-read on subsequent calls', async () => {
    vi.stubGlobal('window', undefined);
    mockReadFileSync
      .mockReturnValueOnce(JSON.stringify(mockHeadings))
      .mockReturnValueOnce(JSON.stringify(mockContents));

    const { getSearchIndex } = await import('../search');
    await getSearchIndex('en');
    await getSearchIndex('en');

    expect(mockReadFileSync).toHaveBeenCalledTimes(2); // still only 2 from the first call
    vi.unstubAllGlobals();
  });

  it('maintains separate cache entries per locale', async () => {
    vi.stubGlobal('window', undefined);
    mockReadFileSync
      .mockReturnValueOnce(JSON.stringify(mockHeadings))
      .mockReturnValueOnce(JSON.stringify(mockContents))
      .mockReturnValueOnce(JSON.stringify([]))
      .mockReturnValueOnce(JSON.stringify([]));

    const { getSearchIndex } = await import('../search');
    const enIndex = await getSearchIndex('en');
    const thIndex = await getSearchIndex('th');

    expect(enIndex.headings).toEqual(mockHeadings);
    expect(thIndex.headings).toEqual([]);
    expect(mockReadFileSync).toHaveBeenCalledTimes(4);
    vi.unstubAllGlobals();
  });

  it('fetches from the network in the browser (window is defined)', async () => {
    // Simulate browser environment
    vi.stubGlobal('window', {});

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockHeadings) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockContents) });
    vi.stubGlobal('fetch', fetchMock);

    const { getSearchIndex } = await import('../search');
    const index = await getSearchIndex('en');

    expect(index.headings).toEqual(mockHeadings);
    expect(index.contents).toEqual(mockContents);
    expect(fetchMock).toHaveBeenCalledWith('/heading-search-index.en.json');
    expect(fetchMock).toHaveBeenCalledWith('/content-search-index.en.json');

    vi.unstubAllGlobals();
  });
});
