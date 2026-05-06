import { SidebarInitializer } from '@/components/docs/sidebar-initializer';
import { getSidebarGroups, listDocSets } from '@/lib/mdx';
import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

interface DocSetLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; docSet: string }>;
}

export const generateStaticParams = async ({ params }: { params: { locale: string } }) => {
  const docSets = await listDocSets(params.locale);
  return docSets.map((ds) => ({ docSet: ds.slug }));
};

const DocSetLayout = async ({ children, params }: DocSetLayoutProps) => {
  const { locale, docSet } = await params;
  setRequestLocale(locale);

  const docSets = await listDocSets(locale);
  const validDocSet = docSets.find((ds) => ds.slug === docSet);
  if (!validDocSet) notFound();

  const sidebarGroups = await getSidebarGroups(locale, docSet);

  return (
    <>
      <SidebarInitializer sidebarGroups={sidebarGroups} currentDocSet={docSet} />
      {children}
    </>
  );
};

export default DocSetLayout;
