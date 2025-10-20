import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CareFlowProvider } from '@/contexts/CareFlowContext';

export const metadata: Metadata = {
  title: 'CareFlow',
  description: 'Efficient Home Healthcare Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-gradient-to-br from-indigo-50 via-white to-pink-50 text-gray-900">
        <CareFlowProvider>
          {children}
          <Toaster />
        </CareFlowProvider>
      </body>
    </html>
  );
}
