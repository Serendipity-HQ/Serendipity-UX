import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Serendipity — Experiences Worth Having',
  description: 'A social network built around real-world experiences.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .liquid-card,
              .liquid-panel {
                backdrop-filter: blur(46px) saturate(1.75) contrast(1.08) brightness(1.16) !important;
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-charcoal">
        <AppProvider>
          <Nav />
          <main className="pb-20 md:pb-0">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
