import { encode } from 'next-auth/jwt';
import { mkdir, writeFile } from 'node:fs/promises';

/** Fixed secret used only for e2e tests. Must match the NEXTAUTH_SECRET
 *  set in the webServer command in playwright.config.ts. */
export const E2E_NEXTAUTH_SECRET = 'e2e-test-secret-do-not-use-in-production';

/** Internal-domain email that bypasses all DAC rules. */
export const E2E_TEST_EMAIL = 'e2e@tcc-technology.com';

export default async function globalSetup() {
  const token = await encode({
    token: {
      name: 'E2E Test User',
      email: E2E_TEST_EMAIL,
      sub: 'e2e-test-user-id',
    },
    secret: E2E_NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 1 day
  });

  const storageState = {
    cookies: [
      {
        name: 'next-auth.session-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
        expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      {
        name: 'NEXT_LOCALE',
        value: 'th',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
        expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
    ],
    origins: [],
  };

  await mkdir('playwright/.auth', { recursive: true });
  await writeFile('playwright/.auth/user.json', JSON.stringify(storageState, null, 2));
}
