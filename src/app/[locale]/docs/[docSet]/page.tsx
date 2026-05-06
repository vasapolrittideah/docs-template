import { listDocGroups, listDocSets, listDocSlugs } from '@/lib/mdx';
import { notFound, redirect } from 'next/navigation';

interface DocSetPageProps {
  params: Promise<{ locale: string; docSet: string }>;
}

const DocSetPage = async ({ params }: DocSetPageProps) => {
  const { locale, docSet } = await params;

  const docSets = await listDocSets(locale);
  if (!docSets.find((ds) => ds.slug === docSet)) notFound();

  const groups = await listDocGroups(locale, docSet);
  if (!groups.length) notFound();

  const firstGroup = groups[0];
  const slugs = await listDocSlugs(locale, docSet, firstGroup);
  if (!slugs.length) notFound();

  redirect(`/${locale}/docs/${docSet}/${firstGroup}/${slugs[0]}`);
};

export default DocSetPage;
