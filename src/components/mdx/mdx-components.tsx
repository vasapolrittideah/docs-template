import type { MDXComponents } from 'mdx/types';
import Headings from './headings';
import ExternalLink from './external-link';
import BulletList from './bullet-list';
import OrderedList from './ordered-list';

const components = {
  h1: (props) => <Headings.H1 {...props} />,
  h2: (props) => <Headings.H2 {...props} />,
  h3: (props) => <Headings.H3 {...props} />,
  h4: (props) => <Headings.H4 {...props} />,
  p: (props) => <p className="mb-4 leading-7" {...props} />,
  a: (props) => <ExternalLink {...props} />,
  ul: (props) => <BulletList {...props} />,
  ol: (props) => <OrderedList {...props} />,
  strong: (props) => <strong className="font-semibold! [&_code]:font-bold" {...props} />,
} satisfies MDXComponents;

export const getMDXComponents = (): MDXComponents => {
  return components;
};
