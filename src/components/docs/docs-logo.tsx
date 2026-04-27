import Link from 'next/link';

const DocsLogo = () => {
  return (
    <Link
      href="/docs/"
      rel="noopener noreferrer"
      className="inline-block leading-0 transition-all duration-200 ease-out hover:-translate-y-1 hover:text-orange-800">
      <span className="font-display cursor-pointer pr-0.5 text-[26px] font-bold">{process.env.APP_NAME}</span>
    </Link>
  );
};

export default DocsLogo;
