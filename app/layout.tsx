// @ts-ignore
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Sessioprovider from '@/components/session-provider'
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react"

import ReactQueryProvider from './dashboard/blog/components/query-client-provider/query-client-provider';

import { SpeedInsights } from "@vercel/speed-insights/next"
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Hardware garage',
  description: 'one of the best Enginner ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en"  suppressHydrationWarning>
      <meta name="google-adsense-account" content="ca-pub-7557474007097933">
    
      </meta>

        <meta name="google-site-verification" content="fHSavvDPZFfd4bkxslX8z-LAzm3GPWk6p2FsyJxDz5I" />
      <head>
        
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7557474007097933"
     crossOrigin="anonymous"></script>
     <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
     <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"/>



      </head>
      <body>
        <ReactQueryProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >

          
            <main className='w-full mx-4'>
              <Analytics/>
              <SpeedInsights/>
            </main>
          {children}
          </ThemeProvider>
          <Toaster />
          <Sessioprovider/>
          </ReactQueryProvider>
      </body>
    </html>
  )
} 
