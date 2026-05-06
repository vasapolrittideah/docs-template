import { SidebarGroup } from '@/types/mdx';
import { create } from 'zustand';

interface SidebarStore {
  sidebarGroups: SidebarGroup[];
  currentDocSet: string;
  setSidebarGroups: (sidebarGroups: SidebarGroup[]) => void;
  setCurrentDocSet: (docSet: string) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  sidebarGroups: [],
  currentDocSet: '',
  setSidebarGroups: (sidebarGroups) => set({ sidebarGroups }),
  setCurrentDocSet: (docSet) => set({ currentDocSet: docSet }),
}));
