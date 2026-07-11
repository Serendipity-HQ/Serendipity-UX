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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html,
              body {
                overflow-x: hidden !important;
              }

              body {
                position: relative !important;
                isolation: isolate !important;
                animation: none !important;
                background-color: #172832 !important;
                background-image:
                  linear-gradient(180deg, rgba(223, 231, 238, 0.20) 0%, rgba(32, 50, 63, 0.28) 34%, rgba(12, 31, 28, 0.82) 100%),
                  linear-gradient(115deg, rgba(237, 244, 248, 0.052) 0 1px, transparent 1px 10rem),
                  linear-gradient(25deg, rgba(237, 244, 248, 0.035) 0 1px, transparent 1px 8rem) !important;
                background-size: auto, 18rem 18rem, 16rem 16rem !important;
              }

              body::before {
                content: "" !important;
                position: fixed !important;
                inset: -18vmax !important;
                z-index: 0 !important;
                pointer-events: none !important;
                background-image:
                  radial-gradient(circle at 12% 8%, rgba(199, 205, 229, 0.34) 0 18rem, transparent 39rem),
                  radial-gradient(circle at 88% 10%, rgba(186, 214, 224, 0.27) 0 19rem, transparent 42rem),
                  radial-gradient(circle at 48% 46%, rgba(242, 229, 214, 0.10) 0 16rem, transparent 36rem),
                  radial-gradient(circle at 82% 82%, rgba(24, 79, 58, 0.44) 0 25rem, transparent 54rem),
                  radial-gradient(circle at 8% 86%, rgba(31, 54, 68, 0.34) 0 22rem, transparent 50rem) !important;
                background-size: 100% 100% !important;
                background-repeat: no-repeat !important;
                opacity: 0.82 !important;
                transform: translate3d(0, 0, 0) scale(1.01);
                transform-origin: center;
                animation: none !important;
              }

              body > :not(script):not(style) {
                position: relative;
                z-index: 1;
              }

              @keyframes serendipity-bokeh-bleed {
                0% { transform: translate3d(-1.5vmax, -1vmax, 0) scale(1.02); }
                50% { transform: translate3d(1.25vmax, 1vmax, 0) scale(1.025); }
                100% { transform: translate3d(-0.75vmax, 1.5vmax, 0) scale(1.02); }
              }

              .liquid-card,
              .liquid-panel {
                backdrop-filter: blur(22px) saturate(1.16) contrast(1.02) brightness(1.04) !important;
                -webkit-backdrop-filter: blur(22px) saturate(1.16) contrast(1.02) brightness(1.04) !important;
              }

              @media (prefers-reduced-motion: reduce) {
                body::before {
                  animation: none !important;
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-charcoal">
        <AppProvider>
          <AppNav />
          <main className="pb-20 md:pb-0">{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}
