import { twMerge } from 'tailwind-merge';

export interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

const H1 = ({ children, className, ...props }: HeadlineProps) => {
  return (
    <h1
      className={twMerge('mt-6 mb-4 scroll-mt-18 text-4xl font-semibold md:scroll-mt-28 xl:scroll-mt-28', className)}
      {...props}>
      {children}
    </h1>
  );
};

const H2 = ({ children, className, ...props }: HeadlineProps) => {
  return (
    <h2
      className={twMerge(
        'mt-6 mb-4 scroll-mt-18 text-3xl font-medium md:scroll-mt-40 xl:scroll-mt-26 [&_code]:ml-0 [&_code]:text-2xl [&_code]:font-semibold',
        className,
      )}
      {...props}>
      {children}
    </h2>
  );
};

const H3 = ({ children, className, ...props }: HeadlineProps) => {
  return (
    <h3
      className={twMerge(
        'mt-6 mb-4 scroll-mt-18 text-2xl font-medium md:scroll-mt-40 xl:scroll-mt-26 [&_code]:ml-0 [&_code]:text-xl [&_code]:font-semibold',
        className,
      )}
      {...props}>
      {children}
    </h3>
  );
};

const H4 = ({ children, className, ...props }: HeadlineProps) => {
  return (
    <h4
      className={twMerge(
        'mt-6 mb-4 scroll-mt-18 text-xl font-medium md:scroll-mt-40 xl:scroll-mt-26 [&_code]:ml-0 [&_code]:text-xl [&_code]:font-semibold',
        className,
      )}
      {...props}>
      {children}
    </h4>
  );
};

const Headings = { H1, H2, H3, H4 };
export default Headings;
