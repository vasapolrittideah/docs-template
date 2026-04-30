import { twMerge } from 'tailwind-merge';
import DocsLogo from '../docs/docs-logo';
import ThemeToggler from '../docs/theme-toggler';
import SearchButton from '../docs/search-button';
import LocaleSwitcher from '../docs/locale-switcher';
import SignOutButton from '../auth/sign-out-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface HeaderProps {
  disabled?: boolean;
  className?: string;
}

const Header = async ({ disabled = false, className }: HeaderProps) => {
  const session = await getServerSession(authOptions);

  return (
    <div
      className={twMerge(
        'bg-bg-white-0 border-b-stroke-soft-200 z-50 flex h-22 items-center justify-end border-b px-8 lg:justify-between',
        className,
      )}>
      <DocsLogo />

      <div className="flex grow items-center justify-end gap-2">
        <SearchButton disabled={disabled} />

        <div className="flex h-full items-center justify-end gap-3 lg:ml-auto">
          <LocaleSwitcher />
          <ThemeToggler />
          {session && <SignOutButton display="icon" />}
        </div>
      </div>
    </div>
  );
};

export default Header;
