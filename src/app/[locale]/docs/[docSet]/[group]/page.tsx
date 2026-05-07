import Link from 'next/link';
import { getGroupMeta, getSidebarGroupsFiltered, listDocGroups } from '@/lib/mdx';
import { TOCInitializer } from '@/components/docs/toc-initializer';
import Headings from '@/components/mdx/headings';
import Footer from '@/components/layout/footer';
import * as Divider from '@/components/common/divider';
import DocsBreadcrumb from '@/components/docs/docs-breadcrumb';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/dac';
import { redirect } from 'next/navigation';

interface GroupPageProps {
  params: Promise<{ locale: string; docSet: string; group: string }>;
}

const GroupPage = async ({ params }: GroupPageProps) => {
  const { locale, docSet, group } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const allowed = await canAccess(email, docSet, group);
  if (!allowed) {
    redirect(email ? `/${locale}/auth/forbidden` : `/${locale}/auth/login`);
  }

  const [navGroups, groupMeta, t] = await Promise.all([
    getSidebarGroupsFiltered(locale, docSet, email),
    getGroupMeta(locale, docSet, group),
    getTranslations('GroupPage'),
  ]);
  const navGroup = navGroups.find((g) => g.group === group);

  if (!navGroup) {
    return <div>{t('notFound')}</div>;
  }

  return (
    <>
      <TOCInitializer headings={[]} />
      <DocsBreadcrumb docSet={docSet} group={group} groupTitle={groupMeta.title} />
      <div>
        <Headings.H1>{navGroup.title}</Headings.H1>
        <p className="text-text-sub-600 mb-8 text-sm">{t('pagesCount', { count: navGroup.pages.length })}</p>

        <Divider.Root variant="line" className="mt-10 mb-8" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {navGroup.pages.map((page) => (
            <Link
              key={page.slug}
              href={`/docs/${docSet}/${page.group}/${page.slug}`}
              className="border-stroke-soft-200 hover:bg-bg-weak-50 shadow-regular-xs flex flex-col rounded-xl border p-5 transition-colors hover:border-transparent hover:shadow-none">
              <span className="text-text-strong-950 flex items-start gap-2 text-xl font-semibold">
                {page.metadata.title}
              </span>
              {page.metadata.description && (
                <span className="text-text-sub-600 mt-3 text-sm">{page.metadata.description}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
      <Footer lastModified={null} lastAuthor={null} />
    </>
  );
};

export default GroupPage;

export const generateStaticParams = async ({ params }: { params: { locale: string; docSet: string } }) => {
  const { locale, docSet } = params;
  const groups = await listDocGroups(locale, docSet);
  return groups.map((group) => ({ group }));
};

export const generateMetadata = async ({ params }: GroupPageProps) => {
  const { locale, docSet, group } = await params;
  const navGroups = await getSidebarGroupsFiltered(locale, docSet, null);
  const navGroup = navGroups.find((g) => g.group === group);

  return {
    title: navGroup?.title ?? group,
  };
};
