import { DocContent, ListItemNode, SectionNode } from '@/types/mdx';
import fs from 'node:fs/promises';
import path from 'node:path';
import _ from 'lodash';
import type { RootContent, ListItem, PhrasingContent } from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { ContentSearchIndexItem, HeadingSearchIndexItem } from '@/types/search';
import { remark } from 'remark';
import stripMarkdown from 'strip-markdown';

const DOCS_PATH = path.join(process.cwd(), 'src/docs');
const OUTPUT_PATH = path.join(process.cwd(), 'public/');

// Parse a numeric-prefixed name (e.g., "01-introduction") into its clean slug
const parsePrefixedName = (name: string): string => {
  const match = /^(\d+)-(.+)$/.exec(name);
  return match ? match[2] : name;
};

const cleanMarkdownText = (mdxText: string): string => {
  const processor = remark().use(stripMarkdown);

  let cleaned = String(processor.processSync(mdxText));

  cleaned = cleaned.replace(/\\+/g, '');

  // Remove all import statements
  cleaned = cleaned.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?\s*$/gm, '');
  cleaned = cleaned.replace(/^import\s+['"].*?['"];?\s*$/gm, ''); // Side-effect imports

  // Remove export const/let/var with objects (handles multi-line)
  cleaned = cleaned.replace(/^export\s+(const|let|var)\s+\w+\s*=\s*\{[\s\S]*?\};?\s*$/gm, '');

  // Remove export default
  cleaned = cleaned.replace(/^export\s+default\s+[\s\S]*?;?\s*$/gm, '');

  // Remove any other export statements
  cleaned = cleaned.replace(/^export\s+.*$/gm, '');

  return cleaned;
};

function getNodeText(node: PhrasingContent): string {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
      return node.value;

    case 'emphasis':
    case 'strong':
    case 'link':
      return node.children.map(getNodeText).join('');

    default:
      return '';
  }
}

const getSection = (markdown: string): SectionNode[] => {
  const tree = unified().use(remarkParse).parse(markdown);
  const stringify = unified().use(remarkStringify);

  const sections: SectionNode[] = [];
  const stack: SectionNode[] = [];
  let buffer: RootContent[] = [];

  const extractListItem = (item: ListItem): ListItemNode => {
    let content = '';
    const children: ListItemNode[] = [];

    item.children.forEach((child) => {
      if (child.type === 'list') {
        const list = child;

        list.children.forEach((nestedItem) => {
          children.push(extractListItem(nestedItem));
        });
      } else {
        const raw = stringify.stringify({ type: 'root', children: [child] });

        const cleaned = cleanMarkdownText(raw);
        if (cleaned) {
          content += (content ? ' ' : '') + cleaned;
        }
      }
    });

    return { content, children };
  };

  const flushBuffer = () => {
    if (stack.length === 0 || buffer.length === 0) return;

    const section = stack[stack.length - 1];

    buffer.forEach((node) => {
      if (node.type === 'paragraph') {
        const raw = stringify.stringify({ type: 'root', children: [node] });

        const cleaned = cleanMarkdownText(raw);
        if (cleaned) {
          section.blocks.push({ type: 'paragraph', content: cleaned });
        }
      }

      if (node.type === 'list') {
        const list = node;

        section.blocks.push({
          type: 'list',
          ordered: list.ordered ?? false,
          items: list.children.map(extractListItem),
        });
      }
    });

    buffer = [];
  };

  tree.children.forEach((node) => {
    if (node.type === 'heading') {
      flushBuffer();

      const heading = node;
      const title = heading.children.map(getNodeText).join('');

      const section: SectionNode = {
        id: _.kebabCase(title),
        title,
        depth: heading.depth,
        blocks: [],
        children: [],
      };

      while (stack.length > 0 && stack[stack.length - 1].depth >= section.depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        sections.push(section);
      } else {
        const parent = stack[stack.length - 1];
        parent.children.push(section);
      }

      stack.push(section);
    } else {
      buffer.push(node);
    }
  });

  flushBuffer();

  return sections;
};

const loadDocContents = async (locale: string): Promise<DocContent[]> => {
  const contents: DocContent[] = [];
  const localePath = path.join(DOCS_PATH, locale);

  const walk = async (dir: string) => {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await walk(fullPath);
      } else if (file.endsWith('.mdx')) {
        const rawContent = await fs.readFile(fullPath, 'utf-8');
        const slug = fullPath
          .replace(localePath, '')
          .replace(/\\/g, '/')
          .replace(/\.mdx$/, '')
          .replace(/^\/+/, '')
          .split('/')
          .map((segment) => parsePrefixedName(segment))
          .join('/');

        contents.push({ slug, rawContent });
      }
    }
  };

  await walk(localePath);

  return contents;
};

const getAllSections = async (locale: string): Promise<Record<string, SectionNode[]>> => {
  const sections: Record<string, SectionNode[]> = {};

  const contents = await loadDocContents(locale);
  contents.forEach(({ slug, rawContent }) => {
    const sectionsForSlug = getSection(rawContent);
    sections[slug] = sectionsForSlug;
  });

  return sections;
};

const flattenListItems = (items: ListItemNode[]): string[] => {
  const result: string[] = [];

  for (const item of items) {
    item.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => result.push(line));

    if (item.children.length > 0) {
      result.push(...flattenListItems(item.children));
    }
  }

  return result;
};

const buildSearchIndex = async (
  locale: string,
): Promise<{
  headings: HeadingSearchIndexItem[];
  contents: ContentSearchIndexItem[];
}> => {
  const headings: HeadingSearchIndexItem[] = [];
  const contents: ContentSearchIndexItem[] = [];

  const getSectionSlug = (slug: string, title: string) =>
    `${slug}#${_.replace(title, /[^ก-๙a-zA-Z0-9\s\-_()]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()}`;

  const walkSection = (section: SectionNode, slug: string, parentPath: string[] = []) => {
    const path = [...parentPath, section.title];
    const baseId = path.join(' > ');

    const rootPath = parentPath.length === 0 ? [section.title] : parentPath;
    const rootId = rootPath.join(' > ');
    const rootTitle = rootPath[0];

    if (!headings.some((heading) => heading.id === baseId)) {
      headings.push({
        type: 'heading',
        id: baseId,
        title: section.title,
        level: section.depth,
        slug: getSectionSlug(slug, section.title),
        rootTitle,
        rootId,
      });
    }

    section.blocks.forEach((block, blockIndex) => {
      if (block.type === 'paragraph') {
        block.content
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) =>
            contents.push({
              type: 'content',
              id: `${baseId}#p${blockIndex}`,
              title: section.title,
              slug: getSectionSlug(slug, section.title),
              content: line,
            }),
          );
      }

      if (block.type === 'list') {
        const items = flattenListItems(block.items);

        items.forEach((item, itemIndex) => {
          contents.push({
            type: 'content',
            id: `${baseId}#l${blockIndex}-i${itemIndex}`,
            title: section.title,
            slug: getSectionSlug(slug, section.title),
            content: item,
          });
        });
      }
    });

    section.children.forEach((child) => walkSection(child, slug, path));
  };

  for (const [slug, sections] of Object.entries(await getAllSections(locale))) {
    sections.forEach((section) => walkSection(section, slug));
  }

  return { headings, contents };
};

const generateSearchIndex = async () => {
  const localeEntries = await fs.readdir(DOCS_PATH, { withFileTypes: true });
  const locales = localeEntries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const locale of locales) {
    const searchIndex = await buildSearchIndex(locale);
    await fs.writeFile(
      `${OUTPUT_PATH}/heading-search-index.${locale}.json`,
      JSON.stringify(searchIndex.headings),
      'utf-8',
    );
    await fs.writeFile(
      `${OUTPUT_PATH}/content-search-index.${locale}.json`,
      JSON.stringify(searchIndex.contents),
      'utf-8',
    );
    console.log(`Generated search index for locale: ${locale}`);
  }

  console.log('Search index generated successfully.');
};

generateSearchIndex().catch((error) => {
  console.error('Error generating search index:', error);
  process.exit(1);
});
