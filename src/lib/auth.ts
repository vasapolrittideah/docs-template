import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';

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

      if (email.endsWith('@tcc-technology.com')) return true;

      const allowedExternalEmails = (process.env.ALLOWED_EXTERNAL_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (allowedExternalEmails.includes(email.toLowerCase())) return true;

      return '/auth/unauthorized';
    },
    async session({ session }) {
      if (session.user?.email) {
        session.user.domain = session.user.email.split('@')[1];
      }
      return session;
    },
  },
};
