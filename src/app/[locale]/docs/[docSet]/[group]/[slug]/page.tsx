import Footer from '@/components/layout/footer';
import DocsBreadcrumb from '@/components/docs/docs-breadcrumb';
import { TOCInitializer } from '@/components/docs/toc-initializer';
import { getDocPage, getGroupMeta, getTOCHeadings, listDocSets, listDocPages } from '@/lib/mdx';
import { setRequestLocale } from 'next-intl/server';

interface DocPageProps {
  params: Promise<{ locale: string; docSet: string; group: string; slug: string }>;
}

const DocPage = async ({ params }: DocPageProps) => {
  const { locale, docSet, group, slug } = await params;
  setRequestLocale(locale);

  const [{ component: MDXComponent, metadata, rawContent, lastModified, lastAuthor }, groupMeta] = await Promise.all([
    getDocPage(locale, docSet, group, slug),
    getGroupMeta(locale, docSet, group),
  ]);
  const headings = getTOCHeadings(rawContent);

  return (
    <>
      <TOCInitializer headings={headings} />
      <DocsBreadcrumb
        docSet={docSet}
        group={group}
        groupTitle={groupMeta.title}
        docTitle={groupMeta.pages?.[slug] ?? metadata.title}
      />
      <MDXComponent />
      <Footer lastModified={lastModified} lastAuthor={lastAuthor} />
    </>
  );
};

export default DocPage;

export const generateStaticParams = async ({ params }: { params: { locale: string; docSet: string } }) => {
  const { locale, docSet } = params;
  const docPages = await listDocPages(locale, docSet);

  return docPages.map((page) => ({
    group: page.group,
    slug: page.slug,
  }));
};

export const generateMetadata = async ({ params }: DocPageProps) => {
  const { locale, docSet, group, slug } = await params;
  const { metadata } = await getDocPage(locale, docSet, group, slug);

  return {
    title: metadata.title,
    description: metadata.description,
  };
};
