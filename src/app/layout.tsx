import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rewatch',
  description: 'comparte lo que te mueve',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rewatch',
  },
  icons: {
    icon: [
      { url: '/logo_pwa.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/logo_pwa.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F4A7B9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-petalia antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
