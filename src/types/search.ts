import { FuseResult } from 'fuse.js';

interface BaseSearchIndexItem {
  id: string;
  title: string;
  slug: string;
}

export interface HeadingSearchIndexItem extends BaseSearchIndexItem {
  type: 'heading';
  level: number;
  rootTitle: string;
  rootId: string;
}

export interface ContentSearchIndexItem extends BaseSearchIndexItem {
  type: 'content';
  content: string;
}

export type SearchIndexItem = HeadingSearchIndexItem | ContentSearchIndexItem;

export type SearchType = 'heading' | 'content';

export type SearchIndex = {
  headings: HeadingSearchIndexItem[];
  contents: ContentSearchIndexItem[];
};

export interface SearchEngine {
  headingSearch: (query: string) => FuseResult<HeadingSearchIndexItem>[];
  contentSearch: (query: string) => FuseResult<ContentSearchIndexItem>[];
  docs: {
    headings: HeadingSearchIndexItem[];
    contents: ContentSearchIndexItem[];
  };
}
export interface SnippetData {
  snippet: string;
  offset: number;
  matchLength: number;
  hasLeading: boolean;
  hasTrailing: boolean;
}
