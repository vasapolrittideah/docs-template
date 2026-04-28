import { ContentSearchIndexItem, HeadingSearchIndexItem, SearchIndexItem } from '@/types/search';
import Fuse, { FuseResult, IFuseOptions } from 'fuse.js';
import { create } from 'zustand';
import { getSearchIndex } from '@/lib/search';

const headingFuseOptions: IFuseOptions<HeadingSearchIndexItem> = {
  keys: ['title'],
  threshold: 0.1,
  includeScore: true,
  includeMatches: true,
  isCaseSensitive: false,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 1,
};

const contentFuseOptions: IFuseOptions<ContentSearchIndexItem> = {
  keys: ['content'],
  threshold: 0.2,
  includeScore: true,
  includeMatches: true,
  isCaseSensitive: false,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

interface SearchStore {
  isReady: boolean;
  isLoading: boolean;
  locale: string | null;
  headingFuse: Fuse<HeadingSearchIndexItem> | null;
  contentFuse: Fuse<ContentSearchIndexItem> | null;
  loadIndex: (locale: string) => Promise<void>;
  search: (query: string) => FuseResult<SearchIndexItem>[];
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  isReady: false,
  isLoading: false,
  locale: null,
  headingFuse: null,
  contentFuse: null,

  loadIndex: async (locale: string) => {
    const { isLoading, locale: currentLocale, isReady } = get();

    // Already loaded for this locale
    if (currentLocale === locale && isReady) return;

    // Currently loading
    if (isLoading) return;

    set({ isLoading: true, isReady: false });

    try {
      const data = await getSearchIndex(locale);
      const headingFuse = new Fuse(data.headings, headingFuseOptions);
      const contentFuse = new Fuse(data.contents, contentFuseOptions);
      set({ headingFuse, contentFuse, isReady: true, isLoading: false, locale });
    } catch (error) {
      console.error('Failed to load search index:', error);
      set({ isLoading: false });
    }
  },

  search: (query: string) => {
    const { headingFuse, contentFuse } = get();
    if (!headingFuse || !contentFuse) return [];

    const results: FuseResult<SearchIndexItem>[] = [];

    const headingResults = headingFuse.search(query);
    const contentResults = contentFuse.search(query);
    results.push(...headingResults, ...contentResults);

    // Sort search results for better relevance display.
    results.sort((a, b) => {
      // 1. heading first
      if (a.item.type !== b.item.type) {
        return a.item.type === 'heading' ? -1 : 1;
      }

      // 2. heading level (lower first)
      if (a.item.type === 'heading' && b.item.type === 'heading') {
        if (a.item.level !== b.item.level) {
          return a.item.level - b.item.level;
        }
      }

      // 3. Fuse score (lower is better)
      if (a.score != null && b.score != null) {
        return a.score - b.score;
      }

      return 0;
    });

    return results;
  },
}));
