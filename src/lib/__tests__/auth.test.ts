import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../dac', () => ({
  isInternalEmailAllowed: vi.fn(),
  isExternalEmailAllowed: vi.fn(),
}));

import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import { isExternalEmailAllowed, isInternalEmailAllowed } from '../dac';
import { authOptions } from '../auth';

const mockIsInternal = vi.mocked(isInternalEmailAllowed);
const mockIsExternal = vi.mocked(isExternalEmailAllowed);

const { signIn, jwt, session } = authOptions.callbacks!;

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// signIn callback
// ---------------------------------------------------------------------------
describe('signIn callback', () => {
  it('returns false when profile has no email', async () => {
    const result = await signIn!({ profile: {}, user: {} as User, account: null });
    expect(result).toBe(false);
  });

  it('returns true for an internal email (via profile.email)', async () => {
    mockIsInternal.mockReturnValue(true);
    const result = await signIn!({ profile: { email: 'user@company.com' }, user: {} as User, account: null });
    expect(result).toBe(true);
  });

  it('falls back to profile.preferred_username (Azure AD) when email is absent', async () => {
    mockIsInternal.mockReturnValue(true);
    const result = await signIn!({
      profile: { preferred_username: 'user@company.com' },
      user: {} as User,
      account: null,
    });
    expect(result).toBe(true);
    expect(mockIsInternal).toHaveBeenCalledWith('user@company.com');
  });

  it('returns true for an allowed external email', async () => {
    mockIsInternal.mockReturnValue(false);
    mockIsExternal.mockResolvedValue(true);
    const result = await signIn!({ profile: { email: 'vendor@external.com' }, user: {} as User, account: null });
    expect(result).toBe(true);
  });

  it('redirects to /auth/unauthorized for a disallowed external email', async () => {
    mockIsInternal.mockReturnValue(false);
    mockIsExternal.mockResolvedValue(false);
    const result = await signIn!({ profile: { email: 'unknown@external.com' }, user: {} as User, account: null });
    expect(result).toBe('/auth/unauthorized');
  });

  it('does not call isExternalEmailAllowed when email is internal', async () => {
    mockIsInternal.mockReturnValue(true);
    await signIn!({ profile: { email: 'user@company.com' }, user: {} as User, account: null });
    expect(mockIsExternal).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// jwt callback
// ---------------------------------------------------------------------------
describe('jwt callback', () => {
  const baseToken = { email: 'user@company.com', sub: 'abc123' } as JWT;

  it('returns token unchanged for an internal email', async () => {
    mockIsInternal.mockReturnValue(true);
    const result = await jwt!({ token: baseToken, user: null!, account: null, trigger: 'update' });
    expect(result).toEqual(baseToken);
  });

  it('returns token unchanged for an allowed external email', async () => {
    mockIsInternal.mockReturnValue(false);
    mockIsExternal.mockResolvedValue(true);
    const result = await jwt!({ token: baseToken, user: null!, account: null, trigger: 'update' });
    expect(result).toEqual(baseToken);
  });

  it('returns null for a disallowed external email (revoke session)', async () => {
    mockIsInternal.mockReturnValue(false);
    mockIsExternal.mockResolvedValue(false);
    const result = await jwt!({ token: baseToken, user: null!, account: null, trigger: 'update' });
    expect(result).toBeNull();
  });

  it('returns token unchanged when email is absent', async () => {
    const tokenWithoutEmail = { sub: 'abc123' } as JWT;
    const result = await jwt!({ token: tokenWithoutEmail, user: null!, account: null, trigger: 'update' });
    expect(result).toEqual(tokenWithoutEmail);
    expect(mockIsInternal).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// session callback
// ---------------------------------------------------------------------------
describe('session callback', () => {
  function makeSession(email?: string): Session {
    return {
      user: email ? { email } : {},
      expires: '2099-01-01',
    } as Session;
  }

  it('sets domain from the email address', async () => {
    const s = makeSession('user@company.com');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await session!({ session: s, token: {} as JWT, user: {} as AdapterUser } as any);
    expect((result.user as { domain?: string })?.domain).toBe('company.com');
  });

  it('handles subdomains correctly', async () => {
    const s = makeSession('user@mail.sub.company.com');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await session!({ session: s, token: {} as JWT, user: {} as AdapterUser } as any);
    expect((result.user as { domain?: string })?.domain).toBe('mail.sub.company.com');
  });

  it('does not set domain when session has no user email', async () => {
    const s = makeSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await session!({ session: s, token: {} as JWT, user: {} as AdapterUser } as any);
    expect((result.user as { domain?: string })?.domain).toBeUndefined();
  });

  it('returns the session object', async () => {
    const s = makeSession('user@company.com');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await session!({ session: s, token: {} as JWT, user: {} as AdapterUser } as any);
    expect(result).toBe(s);
  });
});
