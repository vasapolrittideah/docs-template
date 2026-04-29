'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as FancyButton from '../common/fancy-button';

const StartButton = () => {
  const router = useRouter();
  const t = useTranslations('DocsPage');

  return (
    <FancyButton.Root variant="primary" onClick={() => router.push('/docs/getting-started/introduction')}>
      <span>{t('button')}</span>
    </FancyButton.Root>
  );
};

export default StartButton;
