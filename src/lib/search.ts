import type { RangeTuple } from 'fuse.js';
import { ContentSearchIndexItem, HeadingSearchIndexItem, SearchIndex, SnippetData } from '@/types/search';

let searchIndex: SearchIndex | null = null;

export const getSearchIndex = async () => {
  if (!searchIndex) {
    let headings: HeadingSearchIndexItem[];
    let contents: ContentSearchIndexItem[];

    if (typeof window === 'undefined') {
      // Server / build time — read directly from the public folder on disk
      const fs = await import('fs');
      const path = await import('path');
      const publicDir = path.resolve(process.cwd(), 'public');

      headings = JSON.parse(fs.readFileSync(path.join(publicDir, 'heading-search-index.json'), 'utf-8'));
      contents = JSON.parse(fs.readFileSync(path.join(publicDir, 'content-search-index.json'), 'utf-8'));
    } else {
      // Browser — fetch relative to the current origin (no hardcoded localhost)
      const headingRes = await fetch('/heading-search-index.json');
      headings = await headingRes.json();

      const contentRes = await fetch('/content-search-index.json');
      contents = await contentRes.json();
    }

    searchIndex = { headings, contents };
  }

  return searchIndex;
};

// Get snippet text with highlighted matches
export const getSearchSnippet = (text: string, indices: readonly RangeTuple[], contextLength = 32): SnippetData => {
  if (!indices.length) {
    return {
      snippet: text.slice(0, contextLength * 2),
      offset: 0,
      matchLength: 0,
      hasLeading: false,
      hasTrailing: text.length > contextLength * 2,
    };
  }

  // 1. longest match
  const [start, end] = indices.reduce((longest, current) => {
    const longestLen = longest[1] - longest[0];
    const currentLen = current[1] - current[0];
    return currentLen > longestLen ? current : longest;
  });

  const matchLength = end - start + 1;

  // 2. initial window
  let snippetStart = start - contextLength;
  let snippetEnd = end + contextLength + 1;

  // 3. redistribute if out of bounds
  if (snippetStart < 0) {
    snippetEnd += -snippetStart;
    snippetStart = 0;
  }

  if (snippetEnd > text.length) {
    snippetStart -= snippetEnd - text.length;
    snippetEnd = text.length;
  }

  // 4. clamp again
  snippetStart = Math.max(0, snippetStart);
  snippetEnd = Math.min(text.length, snippetEnd);

  return {
    snippet: text.slice(snippetStart, snippetEnd),
    offset: start - snippetStart,
    matchLength,
    hasLeading: snippetStart > 0,
    hasTrailing: snippetEnd < text.length,
  };
};
