import Header from '@/components/layout/header';
import { authOptions } from '@/lib/auth';
import { RiLock2Fill } from '@remixicon/react';
import { getServerSession } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import AzureADSignInButton from '@/components/auth/azure-ad-sign-in-button';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';

const LoginPage = async () => {
  const session = await getServerSession(authOptions);

  if (session) redirect('/docs');

  const t = await getTranslations('LoginPage');

  return (
    <div className="mx-4 flex min-h-screen flex-col items-center">
      <Header
        disabled
        className="border-l-stroke-soft-200 border-r-stroke-soft-200 sticky top-0 w-full max-w-361 border-r border-l"
      />

      <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 relative flex h-[calc(100vh-5.5rem)] w-full max-w-361 items-start border-r border-l">
        <div className="min-w-0 flex-1">
          <div className="mx-auto mt-40 flex max-w-md flex-col items-center justify-start px-6 text-center">
            <RiLock2Fill className="mb-20" size={28} />
            <div className="text-text-strong-950 mb-14 flex flex-col text-[65px] lg:mb-20 lg:text-[90px]">
              <h1 className="leading-0 font-medium tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-text-sub-600">{t('description')}</p>
            <div className="mt-8 flex w-full flex-col gap-3">
              <AzureADSignInButton />
              <div className="text-text-sub-600 my-4 flex items-center gap-3 text-sm">
                <div className="bg-stroke-soft-200 h-px flex-1" />
                <span>{t('divider')}</span>
                <div className="bg-stroke-soft-200 h-px flex-1" />
              </div>
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
