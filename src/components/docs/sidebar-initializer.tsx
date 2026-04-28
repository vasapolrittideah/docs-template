'use client';

import { useSidebarStore } from '@/stores/sidebar-store';
import { SidebarGroup } from '@/types/mdx';
import { useEffect, useRef } from 'react';

interface SidebarInitializerProps {
  sidebarGroups: SidebarGroup[];
}

export const SidebarInitializer = ({ sidebarGroups }: SidebarInitializerProps) => {
  const setSidebarGroups = useSidebarStore((state) => state.setSidebarGroups);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && sidebarGroups.length > 0) {
      setSidebarGroups(sidebarGroups);
      hasInitialized.current = true;
    }
  }, [sidebarGroups, setSidebarGroups]);

  return null;
};
