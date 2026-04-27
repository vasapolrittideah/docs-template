'use client';

import { usePathname } from 'next/navigation';
import EditOnGitHub from '../docs/edit-on-github';
import PrevNext from '../docs/prev-next';
import VersionDisplay from '../docs/version-display';
import LastModified from '../docs/last-modified';

interface FooterProps {
  lastModified: string | null;
  lastAuthor: string | null;
}

const Footer = ({ lastModified, lastAuthor }: FooterProps) => {
  const pathname = usePathname();

  const isRootPath = pathname === '/docs' || pathname === '/docs/';

  return (
    <div className="mt-16 pb-4">
      {!isRootPath && (
        <div className="mb-2 flex items-center justify-between">
          <EditOnGitHub />
          {lastModified && lastAuthor && <LastModified lastModified={lastModified} lastAuthor={lastAuthor} />}
        </div>
      )}

      <div className="text-text-soft-400 flex w-full flex-col items-center justify-center gap-2 text-sm font-semibold">
        {!isRootPath && <PrevNext />}
        <VersionDisplay />
      </div>
    </div>
  );
};

export default Footer;
