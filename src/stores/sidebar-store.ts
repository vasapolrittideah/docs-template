import { SidebarGroup } from '@/types/mdx';
import { create } from 'zustand';

interface SidebarStore {
  groups: SidebarGroup[];
  setGroups: (navGroups: SidebarGroup[]) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  groups: [],
  setGroups: (navGroups) => set({ groups: navGroups }),
}));
