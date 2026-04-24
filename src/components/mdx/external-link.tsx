export type ExternalLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const ExternalLink = (props: ExternalLinkProps) => {
  return (
    <a
      className="font-medium text-orange-800 underline underline-offset-2 dark:text-orange-400 [&_code]:text-orange-800 [&_code]:dark:text-orange-400"
      {...props}
    />
  );
};

export default ExternalLink;
