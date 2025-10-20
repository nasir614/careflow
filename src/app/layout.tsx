import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CareFlowProvider } from '@/contexts/CareFlowContext';
import { FirebaseProvider } from '@/firebase/provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans bg-background text-foreground">
        <FirebaseProvider>
          <CareFlowProvider>
            {children}
            <Toaster />
          </CareFlowProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
