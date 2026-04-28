import Footer from '@/components/layout/footer';
import DocsBreadcrumb from '@/components/docs/docs-breadcrumb';
import { TOCInitializer } from '@/components/docs/toc-initializer';
import { getDocPage, getGroupMeta, getTOCHeadings, listDocPages } from '@/lib/mdx';
import { setRequestLocale } from 'next-intl/server';

interface DocPageProps {
  params: Promise<{ locale: string; group: string; slug: string }>;
}

const DocPage = async ({ params }: DocPageProps) => {
  const { locale, group, slug } = await params;
  setRequestLocale(locale);

  const [{ component: MDXComponent, metadata, rawContent, lastModified, lastAuthor }, groupMeta] = await Promise.all([
    getDocPage(locale, group, slug),
    getGroupMeta(locale, group),
  ]);
  const headings = getTOCHeadings(rawContent);

  return (
    <>
      <TOCInitializer headings={headings} />
      <DocsBreadcrumb group={group} groupTitle={groupMeta.title} docTitle={groupMeta.pages?.[slug] ?? metadata.title} />
      <MDXComponent />
      <Footer lastModified={lastModified} lastAuthor={lastAuthor} />
    </>
  );
};

export default DocPage;

export const generateStaticParams = async ({ params }: { params: { locale: string } }) => {
  const docPages = await listDocPages(params.locale);

  return docPages.map((page) => ({
    group: page.group,
    slug: page.slug,
  }));
};

export const generateMetadata = async ({ params }: DocPageProps) => {
  const { locale, group, slug } = await params;
  const { metadata } = await getDocPage(locale, group, slug);

  return {
    title: metadata.title,
    description: metadata.description,
  };
};
