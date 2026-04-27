import { HeadingNode } from '@/types/mdx';
import { create } from 'zustand';

interface TOCStore {
  headings: HeadingNode[];
  setHeadings: (headings: HeadingNode[]) => void;
}

export const useTOCStore = create<TOCStore>((set) => ({
  headings: [],
  setHeadings: (headings) => set({ headings }),
}));
