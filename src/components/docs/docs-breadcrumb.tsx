import * as Breadcrumb from '@/components/common/breadcrumb';
import Link from 'next/link';
import { RiArrowRightSLine, RiHomeLine } from '@remixicon/react';
import _ from 'lodash';

interface DocsBreadcrumbProps {
  group: string;
  groupTitle?: string;
  docTitle?: string;
}

const DocsBreadcrumb = ({ group, groupTitle, docTitle }: DocsBreadcrumbProps) => {
  return (
    <Breadcrumb.Root className="mb-8">
      <Breadcrumb.Item asChild>
        <Link href="/docs">
          <Breadcrumb.Icon as={RiHomeLine} />
        </Link>
      </Breadcrumb.Item>

      <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />

      <Breadcrumb.Item asChild active={docTitle == undefined}>
        <Link href={`/docs/${group}`}>{groupTitle ?? _.startCase(group)}</Link>
      </Breadcrumb.Item>

      {docTitle && (
        <>
          <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
          <Breadcrumb.Item active className="cursor-pointer">
            {docTitle}
          </Breadcrumb.Item>
        </>
      )}
    </Breadcrumb.Root>
  );
};

export default DocsBreadcrumb;
