import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DacConfig } from '@/types/dac';

// Mock the fs module so we never touch the real filesystem
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

import fs from 'node:fs/promises';
import { canAccess, isExternalEmailAllowed, isInternalEmailAllowed, loadDacConfig } from '../dac';

// Get the typed mocked function for fs.readFile
const mockReadFile = vi.mocked(fs.readFile);

// Helper to set the mock config for tests
function mockConfig(config: Partial<DacConfig>) {
  mockReadFile.mockResolvedValue(JSON.stringify(config) as never);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------------------
// loadDacConfig
// ---------------------------------------------------------------------------
describe('loadDacConfig', () => {
  it('returns parsed config from file', async () => {
    const config: DacConfig = { rules: [{ docSet: 'user-guide' }] };
    mockReadFile.mockResolvedValue(JSON.stringify(config) as never);

    const result = await loadDacConfig();
    expect(result).toEqual(config);
  });

  it('returns empty config when file cannot be read', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));

    const result = await loadDacConfig();
    expect(result).toEqual({ adminEmails: [], externalEmails: [], rules: [] });
  });
});

// ---------------------------------------------------------------------------
// isInternalEmailAllowed
// ---------------------------------------------------------------------------
describe('isInternalEmailAllowed', () => {
  it('returns true for email matching INTERNAL_EMAIL_DOMAIN', () => {
    vi.stubEnv('INTERNAL_EMAIL_DOMAIN', 'company.com');
    expect(isInternalEmailAllowed('user@company.com')).toBe(true);
  });

  it('returns false for email with different domain', () => {
    vi.stubEnv('INTERNAL_EMAIL_DOMAIN', 'company.com');
    expect(isInternalEmailAllowed('user@other.com')).toBe(false);
  });

  it('returns false when INTERNAL_EMAIL_DOMAIN is not set', () => {
    vi.stubEnv('INTERNAL_EMAIL_DOMAIN', '');
    expect(isInternalEmailAllowed('user@company.com')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isExternalEmailAllowed
// ---------------------------------------------------------------------------
describe('isExternalEmailAllowed', () => {
  it('returns true for an allowed external email', async () => {
    mockConfig({ externalEmails: [{ email: 'vendor@external.com' }], rules: [] });
    expect(await isExternalEmailAllowed('vendor@external.com')).toBe(true);
  });

  it('is case-insensitive', async () => {
    mockConfig({ externalEmails: [{ email: 'Vendor@External.com' }], rules: [] });
    expect(await isExternalEmailAllowed('vendor@external.com')).toBe(true);
  });

  it('returns false for an unknown email', async () => {
    mockConfig({ externalEmails: [{ email: 'other@external.com' }], rules: [] });
    expect(await isExternalEmailAllowed('unknown@external.com')).toBe(false);
  });

  it('returns false when the email entry has expired', async () => {
    mockConfig({
      externalEmails: [{ email: 'vendor@external.com', expiresAt: '2020-01-01T00:00:00Z' }],
      rules: [],
    });
    expect(await isExternalEmailAllowed('vendor@external.com')).toBe(false);
  });

  it('returns true when the email entry has not yet expired', async () => {
    mockConfig({
      externalEmails: [{ email: 'vendor@external.com', expiresAt: '2099-01-01T00:00:00Z' }],
      rules: [],
    });
    expect(await isExternalEmailAllowed('vendor@external.com')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canAccess
// ---------------------------------------------------------------------------
describe('canAccess', () => {
  describe('admin bypass', () => {
    it('grants access to an admin email regardless of rules', async () => {
      mockConfig({
        adminEmails: ['admin@company.com'],
        rules: [{ docSet: 'secret', allowedEmails: ['only@this.com'] }],
      });
      expect(await canAccess('admin@company.com', 'secret')).toBe(true);
    });

    it('admin check is case-insensitive', async () => {
      mockConfig({ adminEmails: ['Admin@Company.com'], rules: [] });
      expect(await canAccess('admin@company.com', 'any-doc-set')).toBe(true);
    });
  });

  describe('no matching rule', () => {
    it('grants access to everyone when no rule covers the resource', async () => {
      mockConfig({ rules: [] });
      expect(await canAccess(null, 'public-docs')).toBe(true);
    });
  });

  describe('docSet-level rule', () => {
    it('grants access when email is in allowedEmails', async () => {
      mockConfig({ rules: [{ docSet: 'internal', allowedEmails: ['alice@company.com'] }] });
      expect(await canAccess('alice@company.com', 'internal')).toBe(true);
    });

    it('grants access when email domain is in allowedDomains', async () => {
      mockConfig({ rules: [{ docSet: 'internal', allowedDomains: ['company.com'] }] });
      expect(await canAccess('bob@company.com', 'internal')).toBe(true);
    });

    it('denies access when email is not in allowedEmails or allowedDomains', async () => {
      mockConfig({ rules: [{ docSet: 'internal', allowedEmails: ['alice@company.com'] }] });
      expect(await canAccess('eve@other.com', 'internal')).toBe(false);
    });

    it('denies access when email is null and a rule exists', async () => {
      mockConfig({ rules: [{ docSet: 'internal', allowedEmails: ['alice@company.com'] }] });
      expect(await canAccess(null, 'internal')).toBe(false);
    });

    it('denies access when rule has expired', async () => {
      mockConfig({
        rules: [{ docSet: 'internal', allowedEmails: ['alice@company.com'], expiresAt: '2020-01-01T00:00:00Z' }],
      });
      expect(await canAccess('alice@company.com', 'internal')).toBe(false);
    });
  });

  describe('group-level rule', () => {
    it('grants access via group rule when no slug rule exists', async () => {
      mockConfig({
        rules: [{ docSet: 'docs', group: 'api', allowedDomains: ['company.com'] }],
      });
      expect(await canAccess('dev@company.com', 'docs', 'api')).toBe(true);
    });

    it('denies access via group rule for unauthorized email', async () => {
      mockConfig({
        rules: [{ docSet: 'docs', group: 'api', allowedDomains: ['company.com'] }],
      });
      expect(await canAccess('dev@external.com', 'docs', 'api')).toBe(false);
    });
  });

  describe('slug-level rule', () => {
    it('slug rule takes precedence over group rule', async () => {
      mockConfig({
        rules: [
          { docSet: 'docs', group: 'api', allowedEmails: ['group@company.com'] },
          { docSet: 'docs', group: 'api', slug: 'secret-page', allowedEmails: ['slug@company.com'] },
        ],
      });
      // group@company.com is allowed at group level but NOT in the slug rule
      expect(await canAccess('group@company.com', 'docs', 'api', 'secret-page')).toBe(false);
      // slug@company.com is allowed at slug level
      expect(await canAccess('slug@company.com', 'docs', 'api', 'secret-page')).toBe(true);
    });
  });

  describe('rule specificity fallback', () => {
    it('falls back to docSet rule when no group/slug rule matches', async () => {
      mockConfig({
        rules: [{ docSet: 'docs', allowedDomains: ['company.com'] }],
      });
      expect(await canAccess('user@company.com', 'docs', 'some-group', 'some-slug')).toBe(true);
    });
  });
});
