'use client';

import { RiMenu2Line } from '@remixicon/react';
import * as Drawer from '../common/drawer';
import Sidebar from '../layout/sidebar';

const SidebarDrawer = () => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="my-2 ml-4 cursor-pointer">
          <div className="text-text-sub-600 hover:text-text-strong-950 flex items-center gap-1.5 text-sm select-none">
            <RiMenu2Line size={12} />
            <span>เอกสาร</span>
          </div>
        </button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Body>
          <Sidebar />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default SidebarDrawer;
