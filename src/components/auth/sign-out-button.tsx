'use client';

import * as Button from '@/components/common/button';
import { RiArrowGoBackLine } from '@remixicon/react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const SignOutButton = () => {
  const t = useTranslations('Auth');

  return (
    <Button.Root
      variant="neutral"
      mode="stroke"
      size="small"
      className="mt-8 w-fit gap-2"
      onClick={() => signOut({ callbackUrl: '/auth/login' })}>
      <RiArrowGoBackLine size={16} />
      {t('signOut')}
    </Button.Root>
  );
};

export default SignOutButton;
