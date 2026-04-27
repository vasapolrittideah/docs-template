'use client';

import { useState, useMemo, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useSidebarStore } from '@/stores/sidebar-store';
import * as Divider from '../common/divider';
import { AnimatePresence, motion } from 'framer-motion';
import { RiArrowRightSLine } from '@remixicon/react';
import SidebarSkeleton from './sidebar-skeleton';
import { SidebarGroup } from '@/types/mdx';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const navGroups = useSidebarStore((state) => state.groups);
  const pathname = usePathname();

  // Store user's manual toggle preferences
  const [userToggledGroups, setUserToggledGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return { 0: true };

    const saved = localStorage.getItem('sidebar-open-groups');
    if (saved) {
      return JSON.parse(saved);
    }
    return { 0: true };
  });

  // Find the group containing the current page (supports both group and slug pages)
  const activeGroupIndex = useMemo(() => {
    return navGroups.findIndex(
      (group) =>
        `/docs/${group.group}` === pathname ||
        group.pages.some((page) => `/docs/${page.group}/${page.slug}` === pathname),
    );
  }, [navGroups, pathname]);

  const isGroupPage = pathname.split('/').filter(Boolean).length === 2;

  // Merge user toggles with auto-open for active group (only on doc pages)
  const openGroups = useMemo(() => {
    const merged = { ...userToggledGroups };
    // Auto-open active group only on doc pages, not on group pages (allow toggle on group pages)
    if (activeGroupIndex !== -1 && !isGroupPage) {
      merged[activeGroupIndex] = true;
    }
    return merged;
  }, [userToggledGroups, activeGroupIndex, isGroupPage]);

  const handleGroupClick = (e: MouseEvent<HTMLAnchorElement>, group: SidebarGroup, index: number) => {
    const isCurrentGroupPage = pathname === `/docs/${group.group}`;
    if (isCurrentGroupPage) {
      e.preventDefault();
    }
    setUserToggledGroups((prev) => {
      const newState = { ...prev, [index]: isCurrentGroupPage ? !prev[index] : true };
      localStorage.setItem('sidebar-open-groups', JSON.stringify(newState));
      return newState;
    });
  };

  if (navGroups.length === 0) return <SidebarSkeleton className={className} />;

  return (
    <nav id="sidebar" className={twMerge('flex flex-col px-8 py-6', className)}>
      {navGroups.map((group, index) => (
        <div key={group.title}>
          <h3 className="text-text-strong-950 text-sm font-semibold uppercase select-none">
            <Link
              href={`/docs/${group.group}`}
              onClick={(e) => handleGroupClick(e, group, index)}
              className={twMerge(
                'flex items-center justify-between transition-colors hover:text-orange-800 dark:hover:text-orange-400',
                pathname === `/docs/${group.group}` && 'text-orange-800 dark:text-orange-400',
              )}>
              {group.title}
              <motion.div
                initial={false}
                animate={{ rotate: openGroups[index] ? 90 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}>
                <RiArrowRightSLine className="text-text-sub-600" size={18} />
              </motion.div>
            </Link>
          </h3>

          <AnimatePresence initial={false}>
            {openGroups[index] && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="space-y-1 overflow-hidden [&_li:first-child]:[&_a]:mt-4">
                {group.pages.map((page) => {
                  const href = `/docs/${page.group}/${page.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={page.slug}>
                      <Link
                        href={href}
                        className={twMerge(
                          'flex items-center rounded-md py-1.5 text-sm transition-colors',
                          isActive
                            ? 'font-semibold text-orange-800 dark:text-orange-400'
                            : 'text-text-sub-600 hover:text-text-strong-950 font-medium',
                        )}>
                        <span className="truncate">{page.metadata.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          <Divider.Root variant="line" className="my-4" />
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
