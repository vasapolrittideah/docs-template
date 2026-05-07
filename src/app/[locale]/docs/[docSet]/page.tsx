import { listDocSets, getSidebarGroupsFiltered } from '@/lib/mdx';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface DocSetPageProps {
  params: Promise<{ locale: string; docSet: string }>;
}

const DocSetPage = async ({ params }: DocSetPageProps) => {
  const { locale, docSet } = await params;

  const docSets = await listDocSets(locale);
  if (!docSets.find((ds) => ds.slug === docSet)) notFound();

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const accessibleGroups = await getSidebarGroupsFiltered(locale, docSet, email);
  const firstGroup = accessibleGroups[0];
  if (!firstGroup || !firstGroup.pages.length) notFound();

  redirect(`/${locale}/docs/${docSet}/${firstGroup.group}/${firstGroup.pages[0].slug}`);
};

export default DocSetPage;
