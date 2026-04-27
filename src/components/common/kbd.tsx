// AlignUI Kbd v0.0.0

import { cn } from '@/lib/tailwind';
import * as React from 'react';

function Kbd({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-bg-weak-50 text-subheading-xs text-text-soft-400 ring-stroke-soft-200 flex h-5 items-center gap-0.5 rounded px-1.5 font-normal whitespace-nowrap ring-1 ring-inset',
        className,
      )}
      {...rest}
    />
  );
}

export { Kbd as Root };
