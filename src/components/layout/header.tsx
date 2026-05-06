import { twMerge } from 'tailwind-merge';
import DocsLogo from '../docs/docs-logo';
import ThemeToggler from '../docs/theme-toggler';
import SearchButton from '../docs/search-button';
import LocaleSwitcher from '../docs/locale-switcher';
import { Session } from 'next-auth';
import Profile from '../docs/profile';
import DocsSwitcher from '../docs/docs-switcher';
import { DocSet } from '@/types/mdx';

interface HeaderProps {
  disabled?: boolean;
  className?: string;
  session?: Session | null;
  docSets?: DocSet[];
}

const Header = ({ disabled = false, className, session, docSets = [] }: HeaderProps) => {
  return (
    <div
      className={twMerge(
        'bg-bg-white-0 border-b-stroke-soft-200 z-50 flex h-22 items-center justify-end border-b px-8 lg:justify-between',
        className,
      )}>
      <DocsLogo />
      <p className="text-text-disabled-300 mx-4 text-xl select-none">/</p>
      <DocsSwitcher docSets={docSets} />

      <div className="flex grow items-center justify-end gap-2">
        <SearchButton disabled={disabled} />

        <div className="flex h-full items-center justify-end gap-3 lg:ml-auto">
          <LocaleSwitcher />
          <ThemeToggler />
          {session && <Profile />}
        </div>
      </div>
    </div>
  );
};

export { type HeaderProps };
export default Header;
