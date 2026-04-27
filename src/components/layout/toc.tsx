'use client';

import { useTOCStore } from '@/stores/toc-store';
import { RiListUnordered } from '@remixicon/react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import TOCSkeleton from './toc-skeleton';

interface TableOfContentsProps {
  className?: string;
  variant?: 'top' | 'side';
  showTitle?: boolean;
  onHeadingClick?: () => void;
}

const SCROLL_THRESHOLD_TOP = 0.01;
const SCROLL_THRESHOLD_BOTTOM = 0.99;
const HEADING_ITEM_HEIGHT = 32;
const HEADER_OFFSET_TOP_VARIANT = 75;
const HEADER_OFFSET_SIDE_VARIANT = 110;

const TOC = ({ className, variant = 'side', showTitle = true, onHeadingClick }: TableOfContentsProps) => {
  const headings = useTOCStore((state) => state.headings);
  const containerRef = useRef<HTMLElement | null>(null);
  const tocRef = useRef<HTMLDivElement | null>(null);

  const headerOffset = variant === 'top' ? HEADER_OFFSET_TOP_VARIANT : HEADER_OFFSET_SIDE_VARIANT;

  useEffect(() => {
    containerRef.current = document.body;
  }, []);

  const [activeId, setActiveId] = useState('');
  const { scrollYProgress } = useScroll({ container: containerRef });
  const indicatorY = useSpring(0, { stiffness: 1000, damping: 50 });

  const firstHeadingId = headings[0]?.id;

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // At top of page
    if (latest < SCROLL_THRESHOLD_TOP) {
      setActiveId(headings[0]?.id ?? '');
      indicatorY.set(0);
      return;
    }

    // Check if near bottom of page
    if (latest > SCROLL_THRESHOLD_BOTTOM) {
      const lastHeadingId = headings[headings.length - 1]?.id ?? '';
      if (lastHeadingId && activeId !== lastHeadingId) {
        setActiveId(lastHeadingId);
        indicatorY.set((headings.length - 1) * HEADING_ITEM_HEIGHT);
      }
      return;
    }

    // Loop in reverse to find the active heading
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.level === 1) continue;

      const element = document.getElementById(heading.id);
      if (element && element.getBoundingClientRect().top <= headerOffset) {
        if (activeId !== heading.id) {
          setActiveId(heading.id);
          const index = headings.findIndex((h) => h.id === heading.id);
          indicatorY.set(index * HEADING_ITEM_HEIGHT);
        }
        break; // Stop after finding the first match
      }
    }
  });

  useEffect(() => {
    if (!activeId || !tocRef.current) return;

    if (activeId === firstHeadingId) {
      tocRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const activeElement = tocRef.current.querySelector(`a[href="#${CSS.escape(activeId)}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId, firstHeadingId]);

  if (headings.length === 0) return <TOCSkeleton className={className} variant={variant} showTitle={showTitle} />;

  return (
    <div
      ref={tocRef}
      id="sidebar"
      className={twMerge(
        'overflow-auto px-8 py-6',
        className,
        variant === 'side' ? 'max-h-[80vh] lg:max-h-screen' : 'max-h-[calc(100vh-200px)]',
      )}>
      <div className="flex min-w-0 flex-col gap-4 text-sm">
        {showTitle && (
          <div className="flex items-center">
            <RiListUnordered size={14} className="text-text-soft-400 mr-1.5 shrink-0" />
            <div className="text-text-soft-400 truncate select-none">เนื้อหาในหน้านี้</div>
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-3 text-sm">
          {variant === 'side' && (
            <motion.div
              style={{ y: indicatorY }}
              className="bg-text-strong-950 absolute left-0 h-5 w-px"
              transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
            />
          )}

          {headings.map((heading) => {
            const isActive = (activeId || firstHeadingId) === heading.id;

            return (
              <motion.a
                key={heading.id}
                href={`#${heading.id}`}
                className={twMerge(
                  'relative cursor-pointer truncate transition-colors',
                  isActive ? 'text-text-strong-950 font-medium' : 'text-text-sub-600 hover:text-text-strong-950',
                  heading.level === 3 && 'pl-4',
                  heading.level === 4 && 'pl-8',
                )}
                transition={{ duration: 0.2 }}
                onClick={onHeadingClick}>
                {heading.text}
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TOC;
