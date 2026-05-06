import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listDocSets } from '@/lib/mdx';
import Header, { type HeaderProps } from './header';

type AsyncHeaderProps = Omit<HeaderProps, 'session' | 'docSets'> & { locale: string };

export const AsyncHeader = async ({ locale, ...rest }: AsyncHeaderProps) => {
  const [session, docSets] = await Promise.all([getServerSession(authOptions), listDocSets(locale)]);
  return <Header {...rest} session={session} docSets={docSets} />;
};
