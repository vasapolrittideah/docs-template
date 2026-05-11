import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Transforms .mdx files to valid JS stubs during tests.
// Path-based metadata map covers multiple branch scenarios in getDocPage.
const mdxStub = {
  name: 'test-mdx-stub',
  enforce: 'pre' as const,
  transform(_code: string, id: string) {
    if (!id.endsWith('.mdx')) return;
    const slug = path.basename(id, '.mdx');
    const metadataMap: Record<string, object> = {
      introduction: { title: 'Introduction', description: 'Intro desc' },
      installation: { updatedDate: '2024-01-15' },
    };
    const metadata = metadataMap[slug] ?? {};
    return {
      code: `export default () => null;\nexport const metadata = ${JSON.stringify(metadata)};`,
      map: null,
    };
  },
};

export default defineConfig({
  plugins: [react(), mdxStub],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      exclude: ['src/lib/__tests__/**', 'src/lib/shiki.ts', 'src/lib/navigation.ts'],
      reporter: ['text', 'html'],
    },
  },
});
