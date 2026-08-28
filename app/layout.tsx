import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Caprus ID Studio',
  description: 'Prepare high-resolution employee ID cards from approved HR details.',
  openGraph: {
    title: 'Caprus ID Studio',
    description: 'High-resolution employee ID cards, prepared by HR.',
    images: [{ url: '/og.png', width: 1792, height: 932 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caprus ID Studio',
    description: 'High-resolution employee ID cards, prepared by HR.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
