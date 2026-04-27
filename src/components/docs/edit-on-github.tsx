'use client';

import { RiPencilLine } from '@remixicon/react';
import { usePathname } from 'next/navigation';

const EditOnGitHub = () => {
  const pathname = usePathname();

  return (
    <div
      className="text-text-sub-600 hover:text-text-strong-950 flex w-fit cursor-pointer items-center text-sm select-none"
      onClick={() => {
        window.open(`${process.env.GIT_REPO_URL}/blob/main/src/${pathname}.md`, '_blank');
      }}>
      <RiPencilLine size={18} /> <span className="ml-1">แก้ไขหน้านี้</span>
    </div>
  );
};

export default EditOnGitHub;
