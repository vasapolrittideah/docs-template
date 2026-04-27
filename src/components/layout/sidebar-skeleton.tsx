import { twMerge } from 'tailwind-merge';
import * as Divider from '../common/divider';

interface SidebarSkeletonProps {
  className?: string;
}

const SidebarSkeleton = ({ className }: SidebarSkeletonProps) => {
  return (
    <nav className={twMerge('flex animate-pulse flex-col px-8 py-6', className)}>
      {/* Group 1 */}
      <div>
        <div className="bg-bg-soft-200 mb-4 h-4 w-32 rounded" />
        <div className="space-y-3">
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
          <div className="bg-bg-soft-200 h-3 w-5/6 rounded" />
          <div className="bg-bg-soft-200 h-3 w-4/5 rounded" />
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
        </div>
        <Divider.Root variant="line" className="my-4" />
      </div>

      {/* Group 2 */}
      <div>
        <div className="bg-bg-soft-200 mb-4 h-4 w-28 rounded" />
        <div className="space-y-3">
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
          <div className="bg-bg-soft-200 h-3 w-3/4 rounded" />
          <div className="bg-bg-soft-200 h-3 w-5/6 rounded" />
        </div>
        <Divider.Root variant="line" className="my-4" />
      </div>

      {/* Group 3 */}
      <div>
        <div className="bg-bg-soft-200 mb-4 h-4 w-36 rounded" />
        <div className="space-y-3">
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
          <div className="bg-bg-soft-200 h-3 w-4/5 rounded" />
          <div className="bg-bg-soft-200 h-3 w-5/6 rounded" />
          <div className="bg-bg-soft-200 h-3 w-3/4 rounded" />
          <div className="bg-bg-soft-200 h-3 w-full rounded" />
        </div>
        <Divider.Root variant="line" className="my-4" />
      </div>
    </nav>
  );
};

export default SidebarSkeleton;
