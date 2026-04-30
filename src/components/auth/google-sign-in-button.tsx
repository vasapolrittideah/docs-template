'use client';

import * as Button from '@/components/common/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { RiLoader2Line } from '@remixicon/react';
import { useTranslations } from 'next-intl';

const GoogleSignInButton = () => {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/docs' });
  };

  return (
    <Button.Root
      mode="stroke"
      variant="neutral"
      size="medium"
      className="w-full"
      disabled={isLoading}
      onClick={handleSignIn}>
      {isLoading ? (
        <RiLoader2Line className="animate-spin" size={20} />
      ) : (
        <Image src="/google.svg" alt="Google" width={18} height={18} />
      )}
      <p>{t('signInWithGoogle')}</p>
    </Button.Root>
  );
};

export default GoogleSignInButton;
