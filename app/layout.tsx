import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Sessioprovider from '@/components/session-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: 'AppDrop - APK & IPA Over-The-Air Testing & Distribution Platform',
  description: 'Deploy, test, and distribute iOS .IPA and Android .APK builds over-the-air. Separate releases by DEV, UAT, and PROD with QR codes and instant install links.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-slate-950 text-slate-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
