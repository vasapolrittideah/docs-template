'use client';

import { formatDate } from '@/lib/date';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface LastModifiedProps {
  lastModified: string;
  lastAuthor: string;
}

const LastModified = ({ lastModified, lastAuthor }: LastModifiedProps) => {
  const t = useTranslations('LastModified');
  const { locale } = useParams<{ locale: string }>();

  return (
    <p className="w-60 text-end text-sm italic sm:w-auto">
      <span className="text-text-sub-600">{t('editedOn')}</span> <span>{formatDate(lastModified, locale)}</span>{' '}
      <span className="text-text-sub-600">{t('by')}</span> <span>{lastAuthor}</span>
    </p>
  );
};

export default LastModified;
