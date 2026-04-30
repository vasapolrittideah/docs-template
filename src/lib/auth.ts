import { AllowedExternalEmail } from '@/types/auth';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';

const COMPANY_DOMAIN = 'tcc-technology.com';

function getAllowedExternalEmails(): AllowedExternalEmail[] {
  return (process.env.ALLOWED_EXTERNAL_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIndex = entry.lastIndexOf(':');
      if (colonIndex === -1) return { email: entry.toLowerCase() };
      const email = entry.slice(0, colonIndex).trim().toLowerCase();
      const dateStr = entry.slice(colonIndex + 1).trim();
      const expiresAt = dateStr ? new Date(dateStr) : undefined;
      return { email, expiresAt };
    });
}

function isExternalEmailAllowed(email: string): boolean {
  const entry = getAllowedExternalEmails().find((e) => e.email === email.toLowerCase());
  if (!entry) return false;
  if (entry.expiresAt && entry.expiresAt < new Date()) return false;
  return true;
}

function isInternalEmailAllowed(email: string): boolean {
  if (email.endsWith(`@${COMPANY_DOMAIN}`)) return true;
  return false;
}

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

      if (isExternalEmailAllowed(email)) return true;

      return '/auth/unauthorized';
    },
    async jwt({ token }) {
      const email = token.email;
      if (email && !isInternalEmailAllowed(email)) {
        if (!isExternalEmailAllowed(email)) {
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
