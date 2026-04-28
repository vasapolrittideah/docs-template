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
      <div className="flex grow flex-col items-center justify-center text-center">
        <div className="text-text-sub-600 mb-10 flex flex-col sm:mb-14 lg:mb-20">
          <p>{t('placeholder')}</p>
        </div>
      </div>
    </div>
  );
};

export default RootPage;
