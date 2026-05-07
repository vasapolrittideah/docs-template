import { SidebarInitializer } from '@/components/docs/sidebar-initializer';
import { getSidebarGroups, getSidebarGroupsFiltered, listDocSets } from '@/lib/mdx';
import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
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

  const [sidebarGroups, allGroups] = await Promise.all([
    getSidebarGroupsFiltered(locale, docSet, email),
    getSidebarGroups(locale, docSet),
  ]);

  // Groups exist but none accessible → user is blocked at group level
  if (allGroups.length > 0 && sidebarGroups.length === 0) {
    redirect(email ? `/${locale}/auth/forbidden` : `/${locale}/auth/login`);
  }

  return (
    <>
      <SidebarInitializer sidebarGroups={sidebarGroups} currentDocSet={docSet} />
      {children}
    </>
  );
};

export default DocSetLayout;
