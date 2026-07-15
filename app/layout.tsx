import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import AppNav from '@/components/AppNav'

export const metadata: Metadata = {
  title: 'Serendipity — Experiences Worth Having',
  description: 'A social network built around real-world experiences.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen text-charcoal">
        <AppProvider>
          <AppNav />
          <main className="pb-20 md:pb-0">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
