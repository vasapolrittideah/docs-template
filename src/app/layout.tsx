import type { Metadata } from 'next';
import { Geist, Geist_Mono, IBM_Plex_Sans_Thai, Reddit_Sans } from 'next/font/google';
import '@/styles/globals.css';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: '--font-ibm-plex-sans-thai',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai'],
});

const redditSans = Reddit_Sans({
  variable: '--font-reddit-sans',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Docs Template',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${ibmPlexSansThai.variable} ${redditSans.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
