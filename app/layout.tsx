import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import Sessioprovider from '@/components/session-provider';
import { Toaster } from '@/components/ui/toaster';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://droponair.com';
const adsenseClientId =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7557474007097933';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DropOnAir - Free iOS (.IPA) & Android (.APK) Over-The-Air App Distribution',
    template: '%s | DropOnAir OTA Distribution',
  },
  description:
    'DropOnAir (Drop On Air) is the fastest Over-The-Air (OTA) app distribution platform. Upload iOS .IPA and Android .APK builds, auto-generate Apple itms-services manifest.plist & QR codes, and share install links in one tap.',
  keywords: [
    'DropOnAir',
    'Drop On Air',
    'OTA app distribution',
    'install IPA over the air',
    'upload IPA online',
    'upload APK online',
    'share APK link',
    'iOS OTA installer',
    'Diawi alternative',
    'AppsOnAir alternative',
    'Firebase App Distribution alternative',
    'TestFlight alternative',
    'ad-hoc IPA distribution',
    'itms-services manifest.plist generator',
    'online IPA APK inspector',
    'QR code app installer',
    'mobile beta testing platform',
    'Android APK hosting',
    'enterprise iOS app distribution',
  ],
  authors: [{ name: 'Ashish Rohilla', url: siteUrl }],
  creator: 'Ashish Rohilla',
  publisher: 'DropOnAir',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'DropOnAir',
    title: 'DropOnAir - Free iOS (.IPA) & Android (.APK) Over-The-Air App Distribution',
    description:
      'Deploy, test, and distribute iOS .IPA and Android .APK builds over-the-air in seconds with instant QR codes and itms-services manifests.',
    images: [
      {
        url: '/Droponairbanner.png',
        width: 1200,
        height: 630,
        alt: 'DropOnAir - Over-The-Air iOS & Android App Distribution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DropOnAir - iOS (.IPA) & Android (.APK) Over-The-Air Distribution',
    description:
      'Upload .IPA & .APK builds and share instant QR code OTA install links in seconds.',
    images: ['/Droponairbanner.png'],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      '1jFN9QH7c3sW3kK2vs9CfelmUdQX3etitjPmEtSQIgc',
  },
  other: {
    'google-adsense-account': adsenseClientId,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DropOnAir',
    alternateName: 'Drop On Air',
    url: siteUrl,
    image: `${siteUrl}/Droponairbanner.png`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'iOS, Android, Web',
    description:
      'Over-The-Air (OTA) mobile app testing and distribution platform for iOS (.IPA) and Android (.APK) builds with instant QR codes, manifest.plist generation, and S3 multipart uploads.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Ashish Rohilla',
      email: 'ashishrohilla510@gmail.com',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="1jFN9QH7c3sW3kK2vs9CfelmUdQX3etitjPmEtSQIgc"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense Script for Monetizing Public URLs */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
        {/* JSON-LD Structured Data for Google Rich Search Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
