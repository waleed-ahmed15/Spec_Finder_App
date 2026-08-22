import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProviders } from '@/components/providers/app-providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const dynamic = 'force-dynamic';

const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'SpecFinder | Aurelith',
  description: 'Requirement-led specification finder for building materials professionals.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <AppProviders>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
