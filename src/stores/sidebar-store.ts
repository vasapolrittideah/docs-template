import { SerializableNavGroup } from '@/types/mdx';
import { create } from 'zustand';

interface SidebarStore {
  navGroups: SerializableNavGroup[];
  setNavGroups: (navGroups: SerializableNavGroup[]) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  navGroups: [],
  setNavGroups: (navGroups) => set({ navGroups }),
}));
