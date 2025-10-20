import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/inter/variable.css';
import '@fontsource/manrope/variable.css';
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
      <body className="font-sans bg-gradient-to-br from-indigo-50 via-white to-pink-50 text-gray-900">
        <CareFlowProvider>
          {children}
          <Toaster />
        </CareFlowProvider>
      </body>
    </html>
  );
}
