import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/contexts/AuthContext'

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
    default: 'OG Club Radio - Transmisión en Vivo y Chat Comunitario',
    template: '%s | OG Club Radio',
  },
  description: 'Experimenta transmisión de radio en vivo con chat en tiempo real, solicitudes de canciones de la comunidad y funciones interactivas. Únete a oyentes de todo el mundo y descubre buena música juntos.',
  keywords: [
    'radio',
    'transmisión en vivo',
    'música',
    'radio online',
    'og club',
    'chat comunitario',
    'solicitudes de canciones',
    'música en tiempo real',
    'radio web',
    'radio por internet',
    'radio colombia',
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
    locale: 'es_CO',
    url: 'https://ogclub.radio',
    siteName: 'OG Club Radio',
    title: 'OG Club Radio - Transmisión en Vivo y Chat Comunitario',
    description: 'Únete a nuestra comunidad para transmisión de radio en vivo, chat en tiempo real y solicitudes de canciones interactivas. Descubre música con oyentes de todo el mundo.',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image
        width: 1200,
        height: 630,
        alt: 'OG Club Radio - Plataforma de Transmisión en Vivo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Club Radio - Transmisión en Vivo y Comunidad',
    description: 'Únete a nuestra comunidad para transmisión de radio en vivo, chat en tiempo real y solicitudes de canciones interactivas.',
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
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  )
}
