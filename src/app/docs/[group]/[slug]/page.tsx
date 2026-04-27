import Footer from '@/components/layout/footer';
import DocsBreadcrumb from '@/components/docs/docs-breadcrumb';
import { TOCInitializer } from '@/components/docs/toc-initializer';
import { getDocPage, getGroupMeta, getTOCHeadings, listDocPages } from '@/lib/mdx';

interface DocPageProps {
  params: Promise<{ group: string; slug: string }>;
}

const DocPage = async ({ params }: DocPageProps) => {
  const { group, slug } = await params;
  const [{ component: MDXComponent, metadata, rawContent, lastModified, lastAuthor }, groupMeta] = await Promise.all([
    getDocPage(group, slug),
    getGroupMeta(group),
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

export const generateStaticParams = async () => {
  const docPages = await listDocPages();

  return docPages.map((page) => {
    return {
      group: page.group,
      slug: page.slug,
    };
  });
};

export const generateMetadata = async ({ params }: DocPageProps) => {
  const { group, slug } = await params;
  const { metadata } = await getDocPage(group, slug);

  return {
    title: metadata.title,
    description: metadata.description,
  };
};
