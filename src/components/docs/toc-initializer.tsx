'use client';

import { useEffect } from 'react';
import { useTOCStore } from '@/stores/toc-store';
import { HeadingNode } from '@/types/mdx';

interface TOCInitializerProps {
  headings: HeadingNode[];
}

export const TOCInitializer = ({ headings }: TOCInitializerProps) => {
  const setHeadings = useTOCStore((state) => state.setHeadings);

  useEffect(() => {
    setHeadings(headings);
  }, [headings, setHeadings]);

  return null;
};
