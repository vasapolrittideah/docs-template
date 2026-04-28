import fs from 'node:fs/promises';
import path from 'node:path';
import _ from 'lodash';
import { SidebarPage, SidebarGroup, DocPage, DocMetadata, HeadingNode, NavigationGroup } from '@/types/mdx';
import { getLastAuthor, getLastModified } from './git';

const DOCS_PATH = (locale: string) => path.join(process.cwd(), 'src', 'docs', locale);

// Read and parse the root navigation.json for a given locale
const readRootMeta = async (locale: string): Promise<NavigationGroup[]> => {
  const metaPath = path.join(DOCS_PATH(locale), 'navigation.json');
  const content = await fs.readFile(metaPath, 'utf-8');
  return JSON.parse(content) as NavigationGroup[];
};

// List all documentation groups in the order defined by navigation.json
export const listDocGroups = async (locale: string): Promise<string[]> => {
  const meta = await readRootMeta(locale);
  return meta.map((g) => g.slug);
};

// List all documentation slugs within a specific group in the order defined by navigation.json
export const listDocSlugs = async (locale: string, group: string): Promise<string[]> => {
  const meta = await readRootMeta(locale);
  const groupEntry = meta.find((g) => g.slug === group);
  if (!groupEntry) throw new Error(`Group not found: ${group}`);
  return groupEntry.pages.map((p) => p.slug);
};

// List all documentation pages across all groups
export const listDocPages = async (locale: string): Promise<SidebarPage[]> => {
  const groups = await listDocGroups(locale);

  const result = await Promise.all(
    groups.map(async (group) => {
      const slugs = await listDocSlugs(locale, group);

      return Promise.all(
        slugs.map(async (slug) => {
          const { metadata, rawContent, lastModified, lastAuthor } = await getDocPage(locale, group, slug);

          return {
            group,
            slug,
            metadata,
            rawContent,
            lastModified,
            lastAuthor,
          };
        }),
      );
    }),
  );

  return result.flat();
};

// Get a specific documentation page by locale, group and slug
export const getDocPage = async (locale: string, group: string, slug: string): Promise<DocPage> => {
  try {
    const lastModified = getLastModified(`src/docs/${locale}/${group}/${slug}.mdx`);
    const lastAuthor = getLastAuthor(`src/docs/${locale}/${group}/${slug}.mdx`);

    const mdxModule = await import(`@/docs/${locale}/${group}/${slug}.mdx`);

    const metadata: DocMetadata = {
      ...mdxModule.metadata,
      title: mdxModule.metadata?.title ?? _.startCase(slug),
      description: mdxModule.metadata?.description ?? '',
      updatedDate: mdxModule.metadata?.updatedDate ? new Date(mdxModule.metadata.updatedDate) : undefined,
    };

    const mdxFilePath = path.join(DOCS_PATH(locale), group, `${slug}.mdx`);
    const rawContent = await fs.readFile(mdxFilePath, 'utf-8');

    return {
      group,
      slug,
      metadata,
      component: mdxModule.default,
      rawContent,
      lastModified,
      lastAuthor,
    };
  } catch (error) {
    throw new Error(`Error loading document page /${locale}/${group}/${slug}: ${(error as Error).message}`);
  }
};

// Get meta for a specific group by slug
export const getGroupMeta = async (
  locale: string,
  group: string,
): Promise<{ title?: string; pages?: Record<string, string> }> => {
  const meta = await readRootMeta(locale);
  const groupEntry = meta.find((g) => g.slug === group);
  if (!groupEntry) return {};
  return {
    title: groupEntry.title,
    pages: Object.fromEntries(groupEntry.pages.map((p) => [p.slug, p.title])),
  };
};

// Get navigation groups for sidebar (order derived from navigation.json)
export const getSidebarGroups = async (locale: string): Promise<SidebarGroup[]> => {
  const meta = await readRootMeta(locale);

  const sidebarGroups = await Promise.all(
    meta.map(async (groupEntry) => {
      const pages = await Promise.all(
        groupEntry.pages.map(async ({ slug, title }) => {
          const docPage = await getDocPage(locale, groupEntry.slug, slug);
          const page = _.omit(docPage, 'component');
          page.metadata = { ...page.metadata, title };
          return page;
        }),
      );

      return {
        title: groupEntry.title,
        pages,
        group: groupEntry.slug,
      };
    }),
  );

  return sidebarGroups;
};

// Extract headings from MDX content for TOC
export const getTOCHeadings = (mdxContent: string): HeadingNode[] => {
  const extractedHeadings: HeadingNode[] = [];
  const lines = mdxContent.split('\n');

  lines.forEach((line) => {
    const match = /^(#{1,4})\s+(.+)$/.exec(line);
    if (match) {
      extractedHeadings.push({
        id: match[2],
        level: match[1].length,
        text: match[2],
      });
    }
  });

  const filteredHeadings = extractedHeadings
    .filter((heading) => heading.level !== 1)
    .map((heading) => ({
      ...heading,
      text: _.replace(heading.text, /[^ก-๙a-zA-Z0-9\s\/\-_\.()<>:]/g, ''),
      id: _.replace(heading.text, /[^ก-๙a-zA-Z0-9\s\-_]/g, '')
        .replace(/\s{1}/g, '-')
        .toLowerCase(),
    }));

  // Handle duplicate IDs by appending -1, -2, -3, etc.
  const idCounts: Record<string, number> = {};
  const uniqueHeadings = filteredHeadings.map((heading) => {
    let uniqueId = heading.id;

    if (idCounts[heading.id] !== undefined) {
      idCounts[heading.id]++;
      uniqueId = `${heading.id}-${idCounts[heading.id]}`;
    } else {
      idCounts[heading.id] = 0;
    }

    return {
      ...heading,
      id: uniqueId,
    };
  });

  return uniqueHeadings;
};
