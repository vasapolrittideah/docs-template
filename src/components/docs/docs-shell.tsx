'use client';

import SidebarDrawer from '@/components/docs/sidebar-drawer';
import TOCDropdown from '@/components/docs/toc-dropdown';
import Content from '@/components/layout/content';
import Sidebar from '@/components/layout/sidebar';
import TOC from '@/components/layout/toc';
import { useSidebarStore } from '@/stores/sidebar-store';
import { usePathname } from '@/lib/navigation';
import React, { useEffect } from 'react';

interface DocsShellProps {
  children: React.ReactNode;
}

const DocsShell = ({ children }: DocsShellProps) => {
  const sidebarGroups = useSidebarStore((state) => state.sidebarGroups);
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  // segments: [locale?, 'docs', docSet, group?, slug?]
  const docsIndex = segments.indexOf('docs');
  const docsRelative = docsIndex >= 0 ? segments.slice(docsIndex + 1) : [];
  // docsRelative: [] | [docSet] | [docSet, group] | [docSet, group, slug]
  const isRootPage = docsRelative.length === 0;
  const isDocSetPage = docsRelative.length === 1;
  const isGroupPage = docsRelative.length === 2;
  const showSidebar = !isRootPage && !isDocSetPage;
  const showTOC = showSidebar && !isGroupPage;

  useEffect(() => {
    if (!window.location.hash) {
      document.body.scrollTo(0, 0);
    }
  }, [pathname]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      {sidebarGroups.length > 0 && (
        <div className="border-stroke-soft-200 bg-bg-white-0 sticky top-0 z-10 flex w-full max-w-361 justify-between gap-2 border-r border-b border-l p-2 lg:hidden">
          <SidebarDrawer />
          {showTOC && <TOCDropdown />}
        </div>
      )}

      <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 relative flex w-full max-w-361 items-start border-r border-l">
        <Sidebar className="border-r-stroke-soft-200 sticky top-22 hidden h-[calc(100vh-88px)] overflow-y-auto border-r lg:block lg:w-68" />
        {showTOC ? (
          <TOC className="xl:border-l-stroke-soft-200 sticky top-22 order-3 hidden h-[calc(100vh-88px)] overflow-y-auto lg:w-64 xl:block xl:border-l" />
        ) : (
          isGroupPage && (
            <div className="xl:border-l-stroke-soft-200 sticky top-22 order-3 hidden h-[calc(100vh-88px)] lg:w-64 xl:block xl:border-l" />
          )
        )}
        <div className="min-w-0 flex-1">
          {sidebarGroups.length > 0 && showTOC && (
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
