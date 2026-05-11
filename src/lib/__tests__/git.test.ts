import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockReadFileSync = vi.fn();
const mockStatSync = vi.fn();
const mockExecSync = vi.fn();

// Provide both `default` and named exports to handle CJS interop correctly
vi.mock('fs', () => ({
  default: {
    readFileSync: mockReadFileSync,
    statSync: mockStatSync,
  },
}));

vi.mock('child_process', () => ({
  default: { execSync: mockExecSync },
  execSync: mockExecSync,
}));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

// Re-imports git module after resetModules() for a fresh cache state.
// Mock return values must be set BEFORE calling setup() so they are in place
// when the module is first used.
async function importGit() {
  return import('../git');
}

// ---------------------------------------------------------------------------
// getLastModified
// ---------------------------------------------------------------------------
describe('getLastModified', () => {
  it('returns lastModified from pre-generated metadata', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ 'en/user-guide/intro': { lastModified: '2026-01-01T00:00:00Z', lastAuthor: 'Alice' } }),
    );
    const { getLastModified } = await importGit();
    expect(getLastModified('src/docs/en/user-guide/intro.mdx')).toBe('2026-01-01T00:00:00Z');
  });

  it('strips src/docs/ prefix and .mdx extension when resolving slug', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ 'th/api-reference/endpoints': { lastModified: '2026-03-15T12:00:00Z', lastAuthor: 'Bob' } }),
    );
    const { getLastModified } = await importGit();
    expect(getLastModified('src/docs/th/api-reference/endpoints.mdx')).toBe('2026-03-15T12:00:00Z');
  });

  it('falls back to git command when slug is not in metadata', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ 'en/other-page': { lastModified: '2026-01-01T00:00:00Z', lastAuthor: 'Alice' } }),
    );
    mockExecSync.mockReturnValue('2026-05-08T10:00:00+07:00\n');
    const { getLastModified } = await importGit();

    const result = getLastModified('src/docs/en/user-guide/intro.mdx');
    expect(mockExecSync).toHaveBeenCalledOnce();
    expect(result).toBe('2026-05-08T10:00:00+07:00');
  });

  it('falls back to git command when metadata file cannot be read', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockReturnValue('2026-05-08T10:00:00+07:00\n');
    const { getLastModified } = await importGit();

    expect(getLastModified('src/docs/en/user-guide/intro.mdx')).toBe('2026-05-08T10:00:00+07:00');
  });

  it('falls back to statSync when git command returns empty string', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockReturnValue('   ');
    const mtime = new Date('2026-04-01T08:00:00Z');
    mockStatSync.mockReturnValue({ mtime });
    const { getLastModified } = await importGit();

    expect(getLastModified('src/docs/en/user-guide/intro.mdx')).toBe(mtime.toISOString());
  });

  it('falls back to statSync when git command throws', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    const mtime = new Date('2026-04-01T08:00:00Z');
    mockStatSync.mockReturnValue({ mtime });
    const { getLastModified } = await importGit();

    expect(getLastModified('src/docs/en/user-guide/intro.mdx')).toBe(mtime.toISOString());
  });

  it('returns current ISO date when both git and statSync fail', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    mockStatSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const before = Date.now();
    const { getLastModified } = await importGit();

    const result = getLastModified('src/docs/en/user-guide/intro.mdx');
    const after = Date.now();

    expect(result).not.toBeNull();
    const resultTime = new Date(result!).getTime();
    expect(resultTime).toBeGreaterThanOrEqual(before);
    expect(resultTime).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// getLastAuthor
// ---------------------------------------------------------------------------
describe('getLastAuthor', () => {
  it('returns lastAuthor from pre-generated metadata', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ 'en/user-guide/intro': { lastModified: '2026-01-01T00:00:00Z', lastAuthor: 'Alice' } }),
    );
    const { getLastAuthor } = await importGit();
    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Alice');
  });

  it('falls back to git command when slug is not in metadata', async () => {
    mockReadFileSync.mockReturnValue(JSON.stringify({}));
    mockExecSync.mockReturnValue('Bob\n');
    const { getLastAuthor } = await importGit();

    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Bob');
    expect(mockExecSync).toHaveBeenCalledOnce();
  });

  it('falls back to VERCEL_GIT_COMMIT_AUTHOR_NAME when git returns empty string', async () => {
    vi.stubEnv('VERCEL_GIT_COMMIT_AUTHOR_NAME', 'Vercel Bot');
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockReturnValue('   ');
    const { getLastAuthor } = await importGit();

    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Vercel Bot');
  });

  it('returns "Unknown" when git returns empty and env var is not set', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockReturnValue('');
    const { getLastAuthor } = await importGit();

    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Unknown');
  });

  it('falls back to VERCEL_GIT_COMMIT_AUTHOR_NAME when git command throws', async () => {
    vi.stubEnv('VERCEL_GIT_COMMIT_AUTHOR_NAME', 'Vercel Bot');
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    const { getLastAuthor } = await importGit();

    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Vercel Bot');
  });

  it('returns "Unknown" when git throws and env var is not set', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    const { getLastAuthor } = await importGit();

    expect(getLastAuthor('src/docs/en/user-guide/intro.mdx')).toBe('Unknown');
  });

  it('uses cached metadata on subsequent calls', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ 'en/user-guide/intro': { lastModified: '2026-01-01T00:00:00Z', lastAuthor: 'Alice' } }),
    );
    const { getLastAuthor } = await importGit();

    // Call twice — readFileSync should only be called once (cache kicks in)
    getLastAuthor('src/docs/en/user-guide/intro.mdx');
    const result = getLastAuthor('src/docs/en/user-guide/intro.mdx');
    expect(mockReadFileSync).toHaveBeenCalledOnce();
    expect(result).toBe('Alice');
  });
});
