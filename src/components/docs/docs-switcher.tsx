'use client';

import * as Button from '@/components/common/button';
import * as Dropdown from '@/components/common/dropdown';
import { useSidebarStore } from '@/stores/sidebar-store';
import { DocSet } from '@/types/mdx';
import { RiCheckLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

interface DocsSwitcherProps {
  docSets: DocSet[];
}

const DocsSwitcher = ({ docSets }: DocsSwitcherProps) => {
  const currentDocSet = useSidebarStore((state) => state.currentDocSet);
  const router = useRouter();

  const current = docSets.find((ds) => ds.slug === currentDocSet) ?? docSets[0];

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="xsmall">
          <div className="flex max-w-56 items-center">
            <p className="truncate text-sm">{current?.title ?? 'Docs'}</p>
          </div>
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="start" className="w-72 p-2">
        {docSets.map((ds) => {
          const isActive = ds.slug === currentDocSet;
          return (
            <Dropdown.Item
              key={ds.slug}
              className={
                isActive
                  ? 'text-text-sub-600 hover:text-text-strong-950 bg-bg-weak-50'
                  : 'text-text-sub-600 hover:text-text-strong-950'
              }
              onSelect={() => {
                if (isActive) return;
                router.push(`/docs/${ds.slug}`);
              }}>
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-text-strong-950 font-medium">{ds.title}</span>
                  {ds.description && (
                    <span
                      className={twMerge('truncate text-xs', isActive ? 'text-text-strong-950' : 'text-text-sub-600')}>
                      {ds.description}
                    </span>
                  )}
                </div>
                <RiCheckLine
                  size={20}
                  className={twMerge(
                    isActive ? 'text-text-strong-950 shrink-0' : 'text-text-sub-600 shrink-0 opacity-0',
                  )}
                />
              </div>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default DocsSwitcher;
