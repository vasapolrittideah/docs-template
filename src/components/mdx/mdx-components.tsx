import type { MDXComponents } from 'mdx/types';
import Headings from './headings';
import ExternalLink from './external-link';
import BulletList from './bullet-list';
import OrderedList from './ordered-list';
import InlineCode from './inline-code';
import CodeBlock from './code-block';
import * as Divider from '../common/divider';
import Table from './table';

const components = {
  h1: (props) => <Headings.H1 {...props} />,
  h2: (props) => <Headings.H2 {...props} />,
  h3: (props) => <Headings.H3 {...props} />,
  h4: (props) => <Headings.H4 {...props} />,
  p: (props) => <p className="mb-4 leading-7" {...props} />,
  a: (props) => <ExternalLink {...props} />,
  ul: (props) => <BulletList {...props} />,
  ol: (props) => <OrderedList {...props} />,
  hr: (props) => <Divider.Root variant="line" className="mt-10" {...props} />,
  strong: (props) => <strong className="font-semibold! [&_code]:font-bold" {...props} />,
  pre: (props) => {
    const { children, className } = props.children.props;
    const languageMatch = /language-(\w+)/.exec(className ?? '');
    const filePathMatch = /:(.+)$/.exec(className ?? '');

    return (
      <CodeBlock
        code={(children as string).replace(/\n$/, '')}
        language={languageMatch ? languageMatch[1] : ''}
        filePath={filePathMatch ? filePathMatch[1] : undefined}
        enableCopy={props.copy === 'true'}
      />
    );
  },
  code: (props) => <InlineCode>{props.children}</InlineCode>,
  table: (props) => <Table>{props.children}</Table>,
} satisfies MDXComponents;

export const getMDXComponents = (): MDXComponents => {
  return components;
};
