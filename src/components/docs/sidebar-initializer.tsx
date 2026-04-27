'use client';

import { useSidebarStore } from '@/stores/sidebar-store';
import { SerializableNavGroup } from '@/types/mdx';
import { useEffect, useRef } from 'react';

interface SidebarInitializerProps {
  navGroups: SerializableNavGroup[];
}

export const SidebarInitializer = ({ navGroups }: SidebarInitializerProps) => {
  const setNavGroups = useSidebarStore((state) => state.setNavGroups);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && navGroups.length > 0) {
      setNavGroups(navGroups);
      hasInitialized.current = true;
    }
  }, [navGroups, setNavGroups]);

  return null;
};
