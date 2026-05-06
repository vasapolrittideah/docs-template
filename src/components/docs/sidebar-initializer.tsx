'use client';

import { useSidebarStore } from '@/stores/sidebar-store';
import { SidebarGroup } from '@/types/mdx';
import { useEffect } from 'react';

interface SidebarInitializerProps {
  sidebarGroups: SidebarGroup[];
  currentDocSet: string;
}

export const SidebarInitializer = ({ sidebarGroups, currentDocSet }: SidebarInitializerProps) => {
  const setSidebarGroups = useSidebarStore((state) => state.setSidebarGroups);
  const setCurrentDocSet = useSidebarStore((state) => state.setCurrentDocSet);

  useEffect(() => {
    setSidebarGroups(sidebarGroups);
    setCurrentDocSet(currentDocSet);
  }, [sidebarGroups, currentDocSet, setSidebarGroups, setCurrentDocSet]);

  return null;
};
