'use client';

import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';

import * as Button from '../common/button';
import * as Divider from '../common/divider';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

const PrevNext = () => {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarGroups = useSidebarStore((state) => state.sidebarGroups);
  const flattenedSidebarGroups = sidebarGroups.flatMap((group) => group.pages);
  const t = useTranslations('PrevNext');

  const getDocUrl = (group: string, slug: string, docSet: string) => `/docs/${docSet}/${group}/${slug}`;

  const { prevPage, nextPage } = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const docsIdx = segments.indexOf('docs');
    const docsRelative = docsIdx >= 0 ? segments.slice(docsIdx + 1) : [];
    const onGroupPage = docsRelative.length === 2;

    if (onGroupPage) {
      const [docSet, group] = docsRelative;
      const groupIndex = sidebarGroups.findIndex((g) => g.docSet === docSet && g.group === group);
      const prevGroup = groupIndex > 0 ? sidebarGroups[groupIndex - 1] : null;
      const currentGroup = sidebarGroups[groupIndex];

      return {
        prevPage: prevGroup ? prevGroup.pages[prevGroup.pages.length - 1] : null,
        nextPage: currentGroup?.pages[0] ?? null,
      };
    }

    const currentLinkIndex = flattenedSidebarGroups.findIndex(
      (page) => getDocUrl(page.group, page.slug, page.docSet) === pathname,
    );

    return {
      prevPage: currentLinkIndex > 0 ? flattenedSidebarGroups[currentLinkIndex - 1] : null,
      nextPage:
        currentLinkIndex < flattenedSidebarGroups.length - 1 ? flattenedSidebarGroups[currentLinkIndex + 1] : null,
    };
  }, [sidebarGroups, flattenedSidebarGroups, pathname]);

  return (
    <>
      <Divider.Root />
      <div className="mt-4 flex w-full flex-col gap-4 sm:flex-row">
        {prevPage ? (
          <Button.Root
            variant="neutral"
            mode="stroke"
            onClick={() => router.push(getDocUrl(prevPage.group, prevPage.slug, prevPage.docSet))}
            className="flex h-20 w-full items-center justify-start gap-3 shadow-2xl hover:-translate-x-1 sm:w-[50%]">
            <div className="w-fit">
              <RiArrowLeftLine size={20} />
            </div>
            <div className="flex w-full flex-col items-start gap-0.5">
              <span>{t('previous')}</span>
              <span className="w-full truncate pr-8 text-start text-lg text-orange-600">{prevPage.metadata.title}</span>
            </div>
          </Button.Root>
        ) : (
          <div className="hidden w-[50%] sm:block" />
        )}

        {nextPage ? (
          <Button.Root
            variant="neutral"
            mode="stroke"
            onClick={() => router.push(getDocUrl(nextPage.group, nextPage.slug, nextPage.docSet))}
            className="flex h-20 w-full items-center justify-end gap-3 hover:translate-x-1 sm:w-[50%]">
            <div className="flex w-full flex-col items-end gap-0.5">
              <span>{t('next')}</span>
              <span className="w-full truncate pl-8 text-end text-lg text-orange-600">{nextPage.metadata.title}</span>
            </div>
            <div className="w-fit">
              <RiArrowRightLine size={20} />
            </div>
          </Button.Root>
        ) : (
          <div className="hidden w-[50%] sm:block" />
        )}
      </div>
    </>
  );
};

export default PrevNext;
