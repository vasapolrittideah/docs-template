import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Profile {
    preferred_username?: string;
  }

  interface Session {
    user: {
      email: string;
      domain?: string;
    } & DefaultSession['user'];
  }
}
