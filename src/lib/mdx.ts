import fs from 'node:fs/promises';
import path from 'node:path';
import _ from 'lodash';
import { SerializableDocPage, SerializableNavGroup, DocPage, DocMetadata, HeadingNode } from '@/types/mdx';
import { getLastAuthor, getLastModified } from './git';

const DOCS_PATH = path.join(process.cwd(), 'src', 'docs');

// Parse a numeric-prefixed name (e.g., "01-introduction") into order and clean slug
const parsePrefixedName = (name: string): { order: number; slug: string } => {
  const match = /^(\d+)-(.+)$/.exec(name);
  if (match) {
    return { order: parseInt(match[1], 10), slug: match[2] };
  }
  return { order: Infinity, slug: name };
};

// Resolve a clean group slug to its prefixed directory name
const resolveGroupDir = async (group: string): Promise<string> => {
  const entries = await fs.readdir(DOCS_PATH);
  const match = entries.find((entry) => parsePrefixedName(entry).slug === group);
  if (!match) throw new Error(`Group not found: ${group}`);
  return match;
};

// Resolve a clean page slug to its prefixed filename (without extension)
const resolveSlugFile = async (groupDir: string, slug: string): Promise<string> => {
  const files = await fs.readdir(path.join(DOCS_PATH, groupDir));
  const match = files.find(
    (file) => file.endsWith('.mdx') && parsePrefixedName(file.replace(/\.mdx$/, '')).slug === slug,
  );
  if (!match) throw new Error(`Page not found: ${slug} in ${groupDir}`);
  return match.replace(/\.mdx$/, '');
};

// List all documentation groups (directories), sorted by numeric prefix, returning clean slugs
export const listDocGroups = async (): Promise<string[]> => {
  const entries = await fs.readdir(DOCS_PATH);

  const dirs = await Promise.all(
    entries.map(async (entry) => {
      const stat = await fs.stat(path.join(DOCS_PATH, entry));
      if (!stat.isDirectory()) return null;
      const { order, slug } = parsePrefixedName(entry);
      return { order, slug };
    }),
  );

  return dirs
    .filter((d): d is { order: number; slug: string } => d !== null)
    .sort((a, b) => a.order - b.order)
    .map((d) => d.slug);
};

// List all documentation slugs within a specific group, sorted by numeric prefix, returning clean slugs
export const listDocSlugs = async (group: string): Promise<string[]> => {
  const groupDir = await resolveGroupDir(group);
  const files = await fs.readdir(path.join(DOCS_PATH, groupDir));

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => parsePrefixedName(file.replace(/\.mdx$/, '')))
    .sort((a, b) => a.order - b.order)
    .map((f) => f.slug);
};

// List all documentation pages across all groups
export const listDocPages = async (): Promise<SerializableDocPage[]> => {
  const groups = await listDocGroups();

  const result = await Promise.all(
    groups.map(async (group) => {
      const slugs = await listDocSlugs(group);

      return Promise.all(
        slugs.map(async (slug) => {
          const { metadata, rawContent, lastModified, lastAuthor } = await getDocPage(group, slug);

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

// Get a specific documentation page by group and slug (both are clean, prefix-stripped values)
export const getDocPage = async (group: string, slug: string): Promise<DocPage> => {
  try {
    const groupDir = await resolveGroupDir(group);
    const fileName = await resolveSlugFile(groupDir, slug);
    const lastModified = getLastModified(`src/docs/${groupDir}/${fileName}.mdx`);
    const lastAuthor = getLastAuthor(`src/docs/${groupDir}/${fileName}.mdx`);

    const mdxModule = await import(`@/docs/${groupDir}/${fileName}.mdx`);

    const metadata: DocMetadata = {
      ...mdxModule.metadata,
      title: mdxModule.metadata?.title ?? _.startCase(slug),
      description: mdxModule.metadata?.description ?? '',
      updatedDate: mdxModule.metadata?.updatedDate ? new Date(mdxModule.metadata.updatedDate) : undefined,
    };

    const mdxFilePath = path.join(process.cwd(), 'src', 'docs', groupDir, `${fileName}.mdx`);
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
    throw new Error(`Error loading document page /${group}/${slug}: ${(error as Error).message}`);
  }
};

// Read _meta.json from a group directory if it exists
const readGroupMeta = async (groupDir: string): Promise<{ title?: string; pages?: Record<string, string> }> => {
  try {
    const metaPath = path.join(DOCS_PATH, groupDir, '_meta.json');
    const content = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
};

// Get meta for a specific group by clean slug
export const getGroupMeta = async (group: string): Promise<{ title?: string; pages?: Record<string, string> }> => {
  const groupDir = await resolveGroupDir(group);
  return readGroupMeta(groupDir);
};

// Get navigation groups for sidebar (order derived from filesystem numeric prefixes)
export const getNavGroups = async (): Promise<SerializableNavGroup[]> => {
  const groups = await listDocGroups();

  const navGroups = await Promise.all(
    groups.map(async (group) => {
      const groupDir = await resolveGroupDir(group);
      const meta = await readGroupMeta(groupDir);
      const slugs = await listDocSlugs(group);

      const pages = await Promise.all(
        slugs.map(async (slug) => {
          const docPage = await getDocPage(group, slug);
          const page = _.omit(docPage, 'component');

          if (meta.pages?.[slug]) {
            page.metadata = { ...page.metadata, title: meta.pages[slug] };
          }

          return page;
        }),
      );

      return {
        title: meta.title ?? _.startCase(group),
        pages,
        group,
      };
    }),
  );

  return navGroups;
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
