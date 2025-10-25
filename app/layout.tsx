import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ChakraProvider } from '@/providers/ChakraProvider';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Twitter/X Query System',
  description: 'Search and analyze Twitter/X data with advanced filtering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
