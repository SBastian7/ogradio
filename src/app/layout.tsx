import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import { ToastProvider } from '@/components/ui'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ogclub.radio'), // Update with your actual domain
  title: {
    default: 'OG Club Radio - Live Streaming Music & Community Chat',
    template: '%s | OG Club Radio',
  },
  description: 'Experience live radio streaming with real-time chat, community song requests, and interactive features. Join listeners worldwide and discover great music together.',
  keywords: [
    'radio',
    'live streaming',
    'music',
    'online radio',
    'og club',
    'community chat',
    'song requests',
    'real-time music',
    'web radio',
    'internet radio',
  ],
  authors: [{ name: 'OG Club', url: 'https://ogclub.radio' }],
  creator: 'OG Club',
  publisher: 'OG Club',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ogclub.radio',
    siteName: 'OG Club Radio',
    title: 'OG Club Radio - Live Streaming Music & Community Chat',
    description: 'Join our community for live radio streaming, real-time chat, and interactive song requests. Discover music with listeners worldwide.',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'OG Club Radio - Live Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Club Radio - Live Streaming Music & Community',
    description: 'Join our community for live radio streaming, real-time chat, and interactive song requests.',
    images: ['/og-image.jpg'], // Same image as OG
    creator: '@ogclub', // Update with your Twitter handle
  },
  category: 'entertainment',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
