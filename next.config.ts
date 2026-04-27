import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import { version } from './package.json';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/docs',
        permanent: true,
      },
    ];
  },
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

export default withMDX(nextConfig);
