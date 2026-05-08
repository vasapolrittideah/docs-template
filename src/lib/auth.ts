import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';
import { isExternalEmailAllowed, isInternalEmailAllowed } from './dac';

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/unauthorized',
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? profile?.preferred_username;
      if (!email) return false;

      if (isInternalEmailAllowed(email)) return true;

      if (await isExternalEmailAllowed(email)) return true;

      return '/auth/unauthorized';
    },
    async jwt({ token }) {
      const email = token.email;
      if (email && !isInternalEmailAllowed(email)) {
        if (!(await isExternalEmailAllowed(email))) {
          // NextAuth v4 runtime supports returning null to delete the session
          // cookie immediately, even though the TS type does not reflect this.
          return null as unknown as JWT;
        }
      }
      return token;
    },
    async session({ session }) {
      if (session.user?.email) {
        session.user.domain = session.user.email.split('@')[1];
      }
      return session;
    },
  },
};
