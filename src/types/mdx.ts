import type { Metadata } from 'next/types';
import { FC } from 'react';

export interface DocMetadata extends Metadata {
  title: string;
  description: string;
}

export interface DocPage {
  group: string;
  slug: string;
  metadata: DocMetadata;
  component: FC;
  rawContent: string;
  lastModified: string | null;
  lastAuthor: string | null;
}

export interface NavGroup {
  title: string;
  pages: DocPage[];
}

// Serializable versions for Client Components (excludes functions)
export type SerializableDocPage = Omit<DocPage, 'component'>;

export interface SerializableNavGroup {
  title: string;
  group: string;
  pages: SerializableDocPage[];
}

export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
}

export interface ListItemNode {
  content: string;
  children: ListItemNode[];
}

export interface ListBlock {
  type: 'list';
  ordered: boolean;
  items: ListItemNode[];
}

export type CalloutType = 'info' | 'tip' | 'warning' | 'danger';

export interface CalloutBlock {
  type: 'callout';
  calloutType: CalloutType;
  title: string;
  blocks: ContentBlock[];
}

export interface HeadingNode {
  id: string;
  level: number;
  text: string;
}

export interface SectionNode {
  id: string;
  depth: number;
  title: string;
  blocks: ContentBlock[];
  children: SectionNode[];
}

export type ContentBlock = ParagraphBlock | ListBlock | CalloutBlock;

export type DocContent = Pick<DocPage, 'rawContent' | 'slug'>;
