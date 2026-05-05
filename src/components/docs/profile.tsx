'use client';

import * as Dropdown from '@/components/common/dropdown';
import { RiLogoutBoxLine } from '@remixicon/react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const Profile = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const t = useTranslations('Auth');

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <div className="bg-primary-base border-stroke-sub-300 h-9 w-9 cursor-pointer rounded-full border" />
      </Dropdown.Trigger>
      <Dropdown.Content align="end" className="max-w-60 gap-0">
        <div className="flex flex-col items-start gap-1 p-4 text-sm">
          <p>{user?.name}</p>
          <p className="text-text-sub-600">{user?.email}</p>
        </div>
        <div className="border-bg-sub-300 border-t" />
        <button className="cursor-pointer p-2 text-sm" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
          <div className="hover:bg-bg-weak-50 hover:text-text-strong-950 text-text-sub-600 flex justify-between gap-2 rounded-md p-2">
            <p>{t('signOut')}</p>
            <RiLogoutBoxLine size={18} />
          </div>
        </button>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default Profile;
