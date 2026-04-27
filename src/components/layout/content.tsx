import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

const Content = ({ children, className }: ContentProps) => {
  return (
    <div className={twMerge('mt-12', className)}>
      <div className="main-content mx-auto flex min-h-[calc(100vh-188px)] max-w-3xl flex-col lg:px-10 xl:min-h-[calc(100vh-136px)]">
        {children}
      </div>
    </div>
  );
};

export default Content;
