'use client';

import * as Button from '@/components/common/button';
import Header from '@/components/layout/header';
import { RiArrowGoBackLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const ForbiddenPage = () => {
  const t = useTranslations('ForbiddenPage');
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="mx-4 flex min-h-screen grow flex-col items-center justify-center">
      <Header
        disabled
        className="border-l-stroke-soft-200 border-r-stroke-soft-200 sticky top-0 w-full max-w-361 border-r border-l"
      />

      <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 relative flex h-[calc(100vh-5.5rem)] w-full max-w-361 items-start border-r border-l">
        <div className="mx-auto max-w-150 min-w-0 flex-1">
          <div className="mt-48 flex flex-col items-center justify-start px-6 text-center">
            <div className="mb-14 flex flex-col text-[65px] text-red-500 lg:mb-20 lg:text-[90px]">
              <h1 className="mb-20 leading-px font-bold lg:mb-28">403</h1>
              <h1 className="leading-px font-medium tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-text-sub-600">{t('description')}</p>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="small"
              className="mt-8 w-fit gap-2"
              onClick={() => router.push(`/${locale}/docs`)}>
              <RiArrowGoBackLine size={16} />
              {t('back')}
            </Button.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
