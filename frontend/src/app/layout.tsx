import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReservNow - Premium Event Experiences',
  description: 'Book your next exclusive event with ReservNow.',
};

import { Navbar } from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSession();

  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>
          <Navbar token={token} />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
