import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', () => ({
  default: { readFile: vi.fn() },
}));

vi.mock('./git', () => ({
  getLastModified: vi.fn().mockReturnValue(null),
  getLastAuthor: vi.fn().mockReturnValue(null),
}));

vi.mock('../dac', () => ({
  canAccess: vi.fn(),
}));

import fs from 'node:fs/promises';
import { canAccess } from '../dac';
import {
  getDocPage,
  getGroupMeta,
  getSidebarGroups,
  getSidebarGroupsFiltered,
  getTOCHeadings,
  listAllDocPages,
  listDocGroups,
  listDocPages,
  listDocSets,
  listDocSlugs,
} from '../mdx';

const mockReadFile = vi.mocked(fs.readFile);

beforeEach(() => {
  vi.resetAllMocks();
});

// Minimal navigation (1 group, 1 page) for tests that call getDocPage internally
const minimalNavigation = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    pages: [{ slug: 'introduction', title: 'Intro Override' }],
  },
];

// Sample navigation data for testing
const sampleNavigation = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    pages: [
      { slug: 'introduction', title: 'Introduction' },
      { slug: 'installation', title: 'Installation' },
    ],
  },
  {
    slug: 'api-reference',
    title: 'API Reference',
    pages: [{ slug: 'endpoints', title: 'Endpoints' }],
  },
];

// ---------------------------------------------------------------------------
// getTOCHeadings
// ---------------------------------------------------------------------------
describe('getTOCHeadings', () => {
  it('extracts h2 and h3 headings', () => {
    const content = `# Title\n## Section One\n### Subsection`;
    const headings = getTOCHeadings(content);
    expect(headings).toHaveLength(2);
    expect(headings[0].level).toBe(2);
    expect(headings[1].level).toBe(3);
  });

  it('ignores h1 headings', () => {
    const content = `# Page Title\n## Section`;
    const headings = getTOCHeadings(content);
    expect(headings.every((h) => h.level !== 1)).toBe(true);
  });

  it('generates lowercase hyphenated IDs from heading text', () => {
    const content = `## Hello World`;
    const [heading] = getTOCHeadings(content);
    expect(heading.id).toBe('hello-world');
  });

  it('strips disallowed characters from IDs', () => {
    const content = `## Hello (World)`;
    const [heading] = getTOCHeadings(content);
    expect(heading.id).toBe('hello-world');
  });

  it('preserves allowed special characters in text: / - _ . ( ) < > :', () => {
    const content = `## API: /v1/users <GET>`;
    const [heading] = getTOCHeadings(content);
    expect(heading.text).toBe('API: /v1/users <GET>');
  });

  it('handles Thai text in headings', () => {
    const content = `## การติดตั้ง`;
    const [heading] = getTOCHeadings(content);
    expect(heading.text).toBe('การติดตั้ง');
    expect(heading.id).toContain('การติดตั้ง');
  });

  it('appends -1, -2 for duplicate heading IDs', () => {
    const content = `## Setup\n## Setup\n## Setup`;
    const headings = getTOCHeadings(content);
    expect(headings[0].id).toBe('setup');
    expect(headings[1].id).toBe('setup-1');
    expect(headings[2].id).toBe('setup-2');
  });

  it('returns empty array for content with no headings', () => {
    expect(getTOCHeadings('Just some paragraph text.')).toEqual([]);
  });

  it('extracts up to h4 headings', () => {
    const content = `## H2\n### H3\n#### H4`;
    const headings = getTOCHeadings(content);
    expect(headings.map((h) => h.level)).toEqual([2, 3, 4]);
  });

  it('ignores h5 and deeper headings', () => {
    const content = `##### H5\n###### H6`;
    const headings = getTOCHeadings(content);
    expect(headings).toHaveLength(0);
  });

  it('handles mixed unique and duplicate IDs correctly', () => {
    const content = `## Alpha\n## Beta\n## Alpha`;
    const headings = getTOCHeadings(content);
    expect(headings[0].id).toBe('alpha');
    expect(headings[1].id).toBe('beta');
    expect(headings[2].id).toBe('alpha-1');
  });
});

// ---------------------------------------------------------------------------
// listDocSets
// ---------------------------------------------------------------------------
describe('listDocSets', () => {
  it('returns parsed doc sets from doc-sets.json', async () => {
    const docSets = [
      { slug: 'user-guide', title: 'User Guide' },
      { slug: 'api-reference', title: 'API Reference' },
    ];
    mockReadFile.mockResolvedValue(JSON.stringify(docSets) as never);

    const result = await listDocSets('en');
    expect(result).toEqual(docSets);
  });

  it('propagates errors when the file cannot be read', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT') as never);
    await expect(listDocSets('en')).rejects.toThrow('ENOENT');
  });
});

// ---------------------------------------------------------------------------
// listDocGroups
// ---------------------------------------------------------------------------
describe('listDocGroups', () => {
  it('returns group slugs from navigation.json', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleNavigation) as never);

    const groups = await listDocGroups('en', 'user-guide');
    expect(groups).toEqual(['getting-started', 'api-reference']);
  });
});

// ---------------------------------------------------------------------------
// listDocSlugs
// ---------------------------------------------------------------------------
describe('listDocSlugs', () => {
  it('returns page slugs for a given group', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleNavigation) as never);

    const slugs = await listDocSlugs('en', 'user-guide', 'getting-started');
    expect(slugs).toEqual(['introduction', 'installation']);
  });

  it('throws when the group is not found', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleNavigation) as never);

    await expect(listDocSlugs('en', 'user-guide', 'nonexistent')).rejects.toThrow('Group not found: nonexistent');
  });
});

// ---------------------------------------------------------------------------
// getGroupMeta
// ---------------------------------------------------------------------------
describe('getGroupMeta', () => {
  it('returns title and pages map for an existing group', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleNavigation) as never);

    const meta = await getGroupMeta('en', 'user-guide', 'getting-started');
    expect(meta.title).toBe('Getting Started');
    expect(meta.pages).toEqual({ introduction: 'Introduction', installation: 'Installation' });
  });

  it('returns empty object when group is not found', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleNavigation) as never);

    const meta = await getGroupMeta('en', 'user-guide', 'nonexistent');
    expect(meta).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// getDocPage
// ---------------------------------------------------------------------------
describe('getDocPage', () => {
  it('returns page data with metadata from the MDX module', async () => {
    mockReadFile.mockResolvedValue('# Raw content' as never);

    const page = await getDocPage('en', 'user-guide', 'getting-started', 'introduction');

    expect(page.slug).toBe('introduction');
    expect(page.group).toBe('getting-started');
    expect(page.docSet).toBe('user-guide');
    expect(page.metadata.title).toBe('Introduction');
    expect(page.metadata.description).toBe('Intro desc');
    expect(page.metadata.updatedDate).toBeUndefined();
    expect(page.rawContent).toBe('# Raw content');
  });

  it('falls back to startCase slug when title is absent and parses updatedDate', async () => {
    mockReadFile.mockResolvedValue('' as never);

    const page = await getDocPage('en', 'user-guide', 'getting-started', 'installation');

    expect(page.metadata.title).toBe('Installation');
    expect(page.metadata.description).toBe('');
    expect(page.metadata.updatedDate).toBeInstanceOf(Date);
  });

  it('throws a formatted error when the document cannot be loaded', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT') as never);

    await expect(getDocPage('en', 'user-guide', 'getting-started', 'introduction')).rejects.toThrow(
      'Error loading document page /en/user-guide/getting-started/introduction: ENOENT',
    );
  });
});

// ---------------------------------------------------------------------------
// listDocPages
// ---------------------------------------------------------------------------
describe('listDocPages', () => {
  it('returns all pages across all groups in a doc set', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never) // listDocGroups
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never) // listDocSlugs
      .mockResolvedValueOnce('# content' as never); // getDocPage rawContent

    const pages = await listDocPages('en', 'user-guide');

    expect(pages).toHaveLength(1);
    expect(pages[0].slug).toBe('introduction');
    expect(pages[0].group).toBe('getting-started');
    expect(pages[0].docSet).toBe('user-guide');
  });
});

// ---------------------------------------------------------------------------
// listAllDocPages
// ---------------------------------------------------------------------------
describe('listAllDocPages', () => {
  it('aggregates pages from all doc sets', async () => {
    const docSets = [{ slug: 'user-guide', title: 'User Guide' }];
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(docSets) as never) // listDocSets
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never) // listDocGroups
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never) // listDocSlugs
      .mockResolvedValueOnce('# content' as never); // getDocPage rawContent

    const pages = await listAllDocPages('en');

    expect(pages).toHaveLength(1);
    expect(pages[0].docSet).toBe('user-guide');
  });
});

// ---------------------------------------------------------------------------
// getSidebarGroups
// ---------------------------------------------------------------------------
describe('getSidebarGroups', () => {
  it('returns sidebar groups with title overridden from navigation', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never) // readDocSetMeta
      .mockResolvedValueOnce('# content' as never); // getDocPage rawContent

    const groups = await getSidebarGroups('en', 'user-guide');

    expect(groups).toHaveLength(1);
    expect(groups[0].group).toBe('getting-started');
    expect(groups[0].title).toBe('Getting Started');
    expect(groups[0].pages).toHaveLength(1);
    // Title comes from navigation entry, not MDX metadata
    expect(groups[0].pages[0].metadata.title).toBe('Intro Override');
    expect(groups[0].pages[0].slug).toBe('introduction');
  });
});

// ---------------------------------------------------------------------------
// getSidebarGroupsFiltered
// ---------------------------------------------------------------------------
describe('getSidebarGroupsFiltered', () => {
  const mockCanAccess = vi.mocked(canAccess);

  it('returns all groups when user has full access', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never)
      .mockResolvedValueOnce('# content' as never);
    mockCanAccess.mockResolvedValue(true);

    const groups = await getSidebarGroupsFiltered('en', 'user-guide', 'user@example.com');

    expect(groups).toHaveLength(1);
    expect(groups[0].pages).toHaveLength(1);
  });

  it('excludes groups the user cannot access', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never)
      .mockResolvedValueOnce('# content' as never);
    mockCanAccess.mockResolvedValueOnce(false);

    const groups = await getSidebarGroupsFiltered('en', 'user-guide', 'user@example.com');

    expect(groups).toHaveLength(0);
  });

  it('removes group when all its pages are inaccessible', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never)
      .mockResolvedValueOnce('# content' as never);
    mockCanAccess
      .mockResolvedValueOnce(true) // group accessible
      .mockResolvedValueOnce(false); // page not accessible

    const groups = await getSidebarGroupsFiltered('en', 'user-guide', 'user@example.com');

    expect(groups).toHaveLength(0);
  });

  it('passes null email to canAccess', async () => {
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(minimalNavigation) as never)
      .mockResolvedValueOnce('# content' as never);
    mockCanAccess.mockResolvedValue(true);

    await getSidebarGroupsFiltered('en', 'user-guide', null);

    expect(mockCanAccess).toHaveBeenCalledWith(null, 'user-guide', 'getting-started');
  });
});
