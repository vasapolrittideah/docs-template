import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { version } from './package.json';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  env: {
    version,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug', 'rehype-mdx-code-props', ['rehype-autolink-headings', { behavior: 'prepend' }]],
  },
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(withMDX(nextConfig));
