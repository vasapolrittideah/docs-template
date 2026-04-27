'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import * as Kbd from '../common/kbd';
import * as Input from '../common/input';
import {
  RiArrowDownLongLine,
  RiArrowUpLongLine,
  RiCloseLargeLine,
  RiFileTextLine,
  RiHashtag,
  RiMenuLine,
  RiSearchLine,
} from '@remixicon/react';
import { twMerge } from 'tailwind-merge';
import { FuseResult } from 'fuse.js';
import { getSearchSnippet } from '@/lib/search';
import Link from 'next/link';
import { SearchIndexItem } from '@/types/search';
import { useSearchStore } from '@/stores/search-store';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  isOpen: boolean;
}

const HighlightSnippet = ({
  snippetText,
  offset,
  length,
  hasLeading,
  hasTrailing,
}: {
  snippetText: string;
  offset: number;
  length: number;
  hasLeading: boolean;
  hasTrailing: boolean;
}) => (
  <span className="mr-4 block truncate">
    {hasLeading && '…'}
    {snippetText.slice(0, offset)}
    <span className="font-semibold text-orange-800 underline underline-offset-2">
      {snippetText.slice(offset, offset + length)}
    </span>
    {snippetText.slice(offset + length)}
    {hasTrailing && '…'}
  </span>
);

const SearchModal = ({ searchInputRef, onClose, isOpen }: SearchModalProps) => {
  const router = useRouter();
  const { search, isReady, isLoading, loadIndex } = useSearchStore();
  const [results, setResults] = useState<FuseResult<SearchIndexItem>[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Load search index when modal opens
  useEffect(() => {
    if (isOpen && !isReady && !isLoading) {
      loadIndex();
    }
  }, [isOpen, isReady, isLoading, loadIndex]);

  const handleClose = useCallback(() => {
    setResults(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && isOpen) {
        handleClose();
        return;
      }

      // Only handle arrow keys and Enter if we have results
      if (!results || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          // Prevent if key is being held down (repeat event)
          if (e.repeat) return;

          e.preventDefault();

          // Prevent rapid navigation
          if (isNavigating) return;
          setIsNavigating(true);

          setSelectedIndex((prev) => {
            const next =
              e.key === 'ArrowDown'
                ? prev < results.length - 1
                  ? prev + 1
                  : 0
                : prev > 0
                  ? prev - 1
                  : results.length - 1;

            if (e.key === 'ArrowDown' && next === 0) {
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp' && next === results.length - 1) {
              scrollContainerRef.current?.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
              });
            } else {
              resultRefs.current[next]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }

            return next;
          });

          // Reset navigation lock after a short delay
          setTimeout(() => setIsNavigating(false), 100);
          break;

        case 'Enter':
          // If a result is selected, navigate to it
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            e.preventDefault();
            const selectedResult = results[selectedIndex];
            router.push(`/docs/${selectedResult.item.slug}`);
            handleClose();
          }
          // Otherwise, let the form submit handle the search
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, results, selectedIndex, router, isNavigating]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [searchInputRef, isOpen]);

  const searchDocs = (query: string) => {
    if (!isReady || !query) return [];
    const results = search(query);
    setResults(results);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = searchInputRef.current?.value.trim() ?? '';
    if (!value) return;

    searchDocs(value);
  };

  const handleClear = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setResults(null);
  };

  const handleInputChange = () => {
    setResults(null);
    setSelectedIndex(-1);
    resultRefs.current = [];
  };

  const getSearchResultIcon = (item: SearchIndexItem) => {
    const className = 'text-text-sub-600 mr-1';
    if (item.type === 'heading') {
      return item.level === 1 ? <RiFileTextLine className={className} /> : <RiHashtag className={className} />;
    }

    return <RiMenuLine className={className} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 pb-20">
      {/* Backdrop */}
      <div className="bg-bg-white-0/50 absolute inset-0 transition-opacity" onPointerDown={handleClose} />

      {/* Modal */}
      <div
        className="bg-bg-white-0 border-stroke-sub-300 relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border shadow-xl dark:shadow-black/50"
        onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className={twMerge('border-stroke-soft-200 w-full p-4', results && 'border-b')}>
          <Input.Root size="large">
            <Input.Wrapper>
              <RiSearchLine size={28} className="text-text-sub-600" />
              <Input.Input
                placeholder={isLoading ? 'กำลังโหลด...' : 'ค้นหาเอกสาร'}
                ref={searchInputRef}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <div
                onClick={handleClear}
                className="text-text-sub-600 border-r-stroke-sub-300 cursor-pointer border-r px-2 leading-none select-none">
                ล้าง
              </div>
              <RiCloseLargeLine size={24} className="text-text-sub-600 cursor-pointer" onClick={handleClose} />
            </Input.Wrapper>
          </Input.Root>
        </form>

        {/* Search results */}
        {results !== null && (
          <div id="search" ref={scrollContainerRef} className="overflow-x-hidden overflow-y-auto px-4">
            <div className="flex flex-col items-center gap-6">
              {results.length === 0 && <div className="text-text-soft-400 my-12">ไม่พบผลลัพธ์การค้นหา</div>}
            </div>

            {results.length > 0 && (
              <div className="my-4 flex flex-col gap-2">
                {results.map((result, index) => (
                  <Link
                    ref={(el) => {
                      resultRefs.current[index] = el;
                    }}
                    key={index}
                    href={`/docs/${result.item.slug}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => handleClose()}
                    className={twMerge(
                      'hover:bg-bg-soft-200 border-stroke-soft-200 block cursor-pointer rounded-xl border px-4 py-3 transition-colors',
                      selectedIndex === index && 'bg-bg-soft-200 ring-2 ring-orange-600 ring-offset-2',
                    )}>
                    <div className="text-text-strong-950 flex min-h-12 gap-2">
                      <div className="text-text-strong-950 flex w-full items-center gap-2">
                        <div className="shrink-0">{getSearchResultIcon(result.item)}</div>

                        <div className="w-full pr-5">
                          {(() => {
                            const snippetData = getSearchSnippet(
                              result.item.type === 'heading' ? result.item.title : result.item.content,
                              result.matches!.map((m) => m.indices).flat(),
                            );

                            if (typeof snippetData === 'string') return snippetData;

                            return (
                              <HighlightSnippet
                                snippetText={snippetData.snippet}
                                offset={snippetData.offset}
                                length={snippetData.matchLength}
                                hasLeading={snippetData.hasLeading}
                                hasTrailing={snippetData.hasTrailing}
                              />
                            );
                          })()}

                          {result.item.type === 'heading' && (
                            <div className="text-text-sub-600 truncate text-sm">
                              {result.item.level === 1 ? null : result.item.rootTitle}
                            </div>
                          )}

                          {result.item.type === 'content' && (
                            <div className="text-text-sub-600 truncate text-sm">{result.item.title}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-bg-white-0 border-stroke-soft-200 flex h-13 w-full items-center justify-between rounded-br-2xl rounded-bl-2xl border-t p-4">
          <div className="hidden select-none md:flex">
            <Kbd.Root className="w-fit">ESC</Kbd.Root>
            <span className="text-text-sub-600 pl-2 text-sm">ปิด</span>

            <Kbd.Root className="ml-4 w-fit">ENTER</Kbd.Root>
            <span className="text-text-sub-600 pl-2 text-sm">{selectedIndex >= 0 ? 'เปิด' : 'ค้นหา'}</span>

            <Kbd.Root className="ml-4 w-5 px-1">
              <RiArrowUpLongLine size={13} />
            </Kbd.Root>
            <Kbd.Root className="ml-1 w-5 px-1">
              <RiArrowDownLongLine size={13} />
            </Kbd.Root>
            <span className="text-text-sub-600 pl-2 text-sm">เลือก</span>
          </div>
          <div className="text-text-soft-400 text-sm select-none">ผลการค้นหา {results ? results.length : 0} รายการ</div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
