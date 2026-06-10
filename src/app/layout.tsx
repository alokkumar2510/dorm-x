import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'DORM-X | Quantum Campus Security Platform',
  description: 'An AI-powered, real-time hostel leave management, security command center, and parent sync platform for modern campus environments.',
  keywords: ['hostel management', 'campus security', 'student outpass', 'QR access control', 'warden dashboard', 'real-time notification'],
  authors: [{ name: 'DORM-X Team' }],
  openGraph: {
    title: 'DORM-X | Quantum Campus Security Platform',
    description: 'An AI-powered, real-time hostel leave management, security command center, and parent sync platform.',
    url: 'https://dormx.in',
    siteName: 'DORM-X',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DORM-X | Campus Security',
    description: 'AI-powered, real-time hostel leave management and access control.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
