'use client';

import * as Button from '@/components/common/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { RiLoader2Line } from '@remixicon/react';
import { useTranslations } from 'next-intl';

const AzureADSignInButton = () => {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('azure-ad', { callbackUrl: '/docs' });
  };

  return (
    <Button.Root variant="neutral" size="medium" className="w-full" disabled={isLoading} onClick={handleSignIn}>
      {isLoading ? (
        <RiLoader2Line className="animate-spin" size={20} />
      ) : (
        <Image src="/microsoft.svg" alt="Microsoft" width={18} height={18} />
      )}
      <p>{t('signInWithMicrosoft')}</p>
    </Button.Root>
  );
};

export default AzureADSignInButton;
