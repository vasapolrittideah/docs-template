'use client';

import { routing, type Locale } from '@/i18n/routing';
import * as Button from '@/components/common/button';
import { RiTranslate2, RiCheckLine } from '@remixicon/react';
import * as Dropdown from '@/components/common/dropdown';
import { useParams, usePathname, useRouter } from 'next/navigation';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  th: 'ภาษาไทย',
};

const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params.locale as Locale) ?? routing.defaultLocale;

  const handleSwitch = (locale: Locale) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="medium">
          <Button.Icon>
            <RiTranslate2 size={22} />
          </Button.Icon>
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end" className="max-w-48 p-2">
        {routing.locales.map((locale) => (
          <Dropdown.Item
            key={locale}
            onSelect={() => handleSwitch(locale)}
            className={locale === currentLocale ? 'text-text-strong-950 bg-bg-weak-50' : 'text-text-sub-600'}>
            <div className="flex w-full items-center justify-between">
              <span>{LOCALE_LABELS[locale]}</span>
              {locale === currentLocale && <RiCheckLine size={20} />}
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default LocaleSwitcher;
