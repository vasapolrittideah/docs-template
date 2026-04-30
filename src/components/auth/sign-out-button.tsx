'use client';

import * as Button from '@/components/common/button';
import { RiLogoutBoxLine } from '@remixicon/react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface SignOutButtonProps {
  display: 'icon' | 'text';
}

const SignOutButton = ({ display }: SignOutButtonProps) => {
  const t = useTranslations('Auth');

  if (display === 'icon') {
    return (
      <Button.Root
        variant="neutral"
        mode="stroke"
        size="medium"
        onClick={() => signOut({ callbackUrl: '/auth/login' })}>
        <Button.Icon>
          <RiLogoutBoxLine size={22} />
        </Button.Icon>
      </Button.Root>
    );
  }

  return (
    <Button.Root
      variant="neutral"
      mode="stroke"
      size="small"
      className="mt-8 w-fit gap-2"
      onClick={() => signOut({ callbackUrl: '/auth/login' })}>
      <RiLogoutBoxLine size={16} />
      {t('signOut')}
    </Button.Root>
  );
};

export default SignOutButton;
