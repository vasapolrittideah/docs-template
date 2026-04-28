import { SidebarGroup } from '@/types/mdx';
import { create } from 'zustand';

interface SidebarStore {
  sidebarGroups: SidebarGroup[];
  setSidebarGroups: (sidebarGroups: SidebarGroup[]) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  sidebarGroups: [],
  setSidebarGroups: (sidebarGroups) => set({ sidebarGroups }),
}));
