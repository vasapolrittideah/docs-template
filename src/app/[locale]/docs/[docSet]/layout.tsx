import { SidebarInitializer } from '@/components/docs/sidebar-initializer';
import { getSidebarGroupsFiltered, listDocSets } from '@/lib/mdx';
import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/dac';

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

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const allowed = await canAccess(email, docSet);
  if (!allowed) {
    redirect(email ? `/${locale}/auth/forbidden` : `/${locale}/auth/login`);
  }

  const sidebarGroups = await getSidebarGroupsFiltered(locale, docSet, email);

  return (
    <>
      <SidebarInitializer sidebarGroups={sidebarGroups} currentDocSet={docSet} />
      {children}
    </>
  );
};

export default DocSetLayout;
