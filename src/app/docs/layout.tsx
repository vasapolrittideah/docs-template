import DocsShell from '@/components/docs/docs-shell';
import Header from '@/components/layout/header';
import React from 'react';

interface DocsLayoutProps {
  children: React.ReactNode;
}

const DocsLayout = ({ children }: DocsLayoutProps) => {
  return (
    <div className="mx-4 flex min-h-screen flex-col items-center">
      <Header className="border-l-stroke-soft-200 border-r-stroke-soft-200 w-full max-w-361 border-r border-l lg:sticky lg:top-0" />
      <DocsShell>{children}</DocsShell>
    </div>
  );
};

export default DocsLayout;
