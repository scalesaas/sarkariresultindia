import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Sessioprovider from '@/components/session-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: 'AppsOnAir - APK & IPA Over-The-Air Testing & Distribution Platform',
  description: 'Deploy, test, and distribute iOS .IPA and Android .APK builds over-the-air. Built by Ashish.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[#F8FAFC] text-slate-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
        <Sessioprovider />
      </body>
    </html>
  );
}
