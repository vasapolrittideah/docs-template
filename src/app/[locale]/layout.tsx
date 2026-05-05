import { ThemeProvider } from '@/contexts/theme-provider';
import { SidebarInitializer } from '@/components/docs/sidebar-initializer';
import { getSidebarGroups } from '@/lib/mdx';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { SessionProvider } from '@/contexts/session-provider';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const sidebarGroups = await getSidebarGroups(locale);

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarInitializer sidebarGroups={sidebarGroups} />
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
