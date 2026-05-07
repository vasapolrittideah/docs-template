import Header from '@/components/layout/header';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/auth/sign-out-button';

interface ForbiddenPageProps {
  params: Promise<{ locale: string }>;
}

const ForbiddenPage = async ({ params }: ForbiddenPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/${locale}/auth/login`);

  const t = await getTranslations('ForbiddenPage');

  return (
    <div className="mx-4 flex min-h-screen grow flex-col items-center justify-center">
      <Header
        disabled
        className="border-l-stroke-soft-200 border-r-stroke-soft-200 sticky top-0 w-full max-w-361 border-r border-l"
      />

      <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 relative flex h-[calc(100vh-5.5rem)] w-full max-w-361 items-start border-r border-l">
        <div className="mx-auto max-w-150 min-w-0 flex-1">
          <div className="mt-48 flex flex-col items-center justify-start px-6 text-center">
            <div className="mb-14 flex flex-col text-[65px] text-orange-500 lg:mb-20 lg:text-[90px]">
              <h1 className="mb-20 leading-0 font-bold lg:mb-28">403</h1>
              <h1 className="leading-0 font-medium tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-text-sub-600">{t('description')}</p>
            <SignOutButton display="text" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
