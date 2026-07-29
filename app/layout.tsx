import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import AppNav from '@/components/AppNav'

const homeSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-home-serif',
  display: 'swap',
})

const homeSans = Inter({
  subsets: ['latin'],
  variable: '--font-home-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Serendipity — Experiences Worth Having',
  description: 'A social network built around real-world experiences.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${homeSerif.variable} ${homeSans.variable}`}
    >
      <body className="min-h-screen text-charcoal">
        <AppProvider>
          <AppNav />
          <main className="pb-20 md:pb-0">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
