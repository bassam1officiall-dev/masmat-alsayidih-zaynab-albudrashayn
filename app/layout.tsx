import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مسمط السيدة زينب (البدرشين) — المنيو الديجيتال',
  description:
    'المنيو الديجيتال الرسمي لمسمط السيدة زينب بالبدرشين: وجبات، فواكه اللحوم، طواجن فتة وكوارع، ولائم عائلية مع خدمة الطلب المباشر عبر واتساب.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#181411',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} scroll-smooth`}>
      <body className="bg-paper text-ink font-cairo antialiased selection:bg-accent selection:text-white">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
