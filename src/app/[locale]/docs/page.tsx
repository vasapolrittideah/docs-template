import StartButton from '@/components/docs/start-button';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface DocsPageProps {
  params: Promise<{ locale: string }>;
}

const RootPage = async ({ params }: DocsPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('DocsPage');

  return (
    <div className="border-l-stroke-soft-200 border-r-stroke-soft-200 flex w-full max-w-361 grow flex-col border-r border-l px-6">
      <div className="flex grow flex-col items-center justify-center">
        <div className="text-text-sub-600 flex flex-col">
          <h1 className="font-display mx-auto text-[45px] leading-tight font-bold sm:text-[65px] lg:text-[90px]">
            Docs Template
          </h1>
        </div>
        <p className="text-text-sub-600 mx-auto mt-6 mb-12 text-center lg:max-w-max">{t('description')}</p>
        <StartButton />
      </div>
    </div>
  );
};

export default RootPage;
