import { RiListUnordered } from '@remixicon/react';
import { twMerge } from 'tailwind-merge';

interface TOCSkeletonProps {
  className?: string;
  variant?: 'top' | 'side';
  showTitle?: boolean;
}

const TOCSkeleton = ({ className, variant = 'side', showTitle = true }: TOCSkeletonProps) => {
  return (
    <div
      className={twMerge(
        'animate-pulse overflow-auto px-8 py-6',
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
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
          <div className="bg-bg-soft-200 h-3 w-5/6 rounded" />
          <div className="bg-bg-soft-200 h-3 w-4/5 rounded pl-4" />
          <div className="bg-bg-soft-200 h-3 w-3/4 rounded pl-4" />
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
          <div className="bg-bg-soft-200 h-3 w-5/6 rounded" />
          <div className="bg-bg-soft-200 h-3 w-4/5 rounded pl-4" />
          <div className="bg-bg-soft-200 h-3 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
};

export default TOCSkeleton;
