'use client';

import SidebarDrawer from '@/components/docs/sidebar-drawer';
import TOCDropdown from '@/components/docs/toc-dropdown';
import Content from '@/components/layout/content';
import Sidebar from '@/components/layout/sidebar';
import TOC from '@/components/layout/toc';
import { useSidebarStore } from '@/stores/sidebar-store';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

interface DocsShellProps {
  children: React.ReactNode;
}

const DocsShell = ({ children }: DocsShellProps) => {
  const navGroups = useSidebarStore((state) => state.navGroups);
  const pathname = usePathname();

  const isRootPage = pathname === '/docs' || pathname === '/docs/';
  const isGroupPage = !isRootPage && pathname.split('/').filter(Boolean).length === 2;
  const showSidebar = !isRootPage;
  const showTOC = !isRootPage && !isGroupPage;

  useEffect(() => {
    document.body.scrollTo(0, 0);
  }, [pathname]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      {navGroups.length > 0 && (
        <div className="border-stroke-soft-200 bg-bg-white-0 sticky top-0 z-10 flex w-full max-w-361 justify-between gap-2 border-r border-b border-l p-2 lg:hidden">
          <SidebarDrawer />
          {showTOC && <TOCDropdown />}
        </div>
      )}

      <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 relative flex w-full max-w-361 items-start border-r border-l">
        <Sidebar className="border-r-stroke-soft-200 sticky top-22 hidden h-[calc(100vh-88px)] overflow-y-auto border-r lg:block lg:w-68" />
        {showTOC && (
          <TOC className="xl:border-l-stroke-soft-200 sticky top-22 order-3 hidden h-[calc(100vh-88px)] overflow-y-auto lg:w-64 xl:block xl:border-l" />
        )}
        <div className="min-w-0 flex-1">
          {navGroups.length > 0 && showTOC && (
            <div className="border-stroke-soft-200 bg-bg-white-0 sticky top-22 z-10 hidden gap-2 border-b p-2 lg:flex xl:hidden">
              <TOCDropdown />
            </div>
          )}
          <Content className="px-6">{children}</Content>
        </div>
      </div>
    </>
  );
};

export default DocsShell;
