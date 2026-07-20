'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenText,
  CircleUserRound,
  Compass,
  House,
  Leaf,
  Map,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', mobileLabel: 'Home', icon: House, glyph: 'home' },
  { href: '/discover', label: 'Discover', mobileLabel: 'Discover', icon: Compass, glyph: 'discover' },
  { href: '/passion-path', label: 'Passion Path', mobileLabel: 'Path', icon: Map, glyph: 'path' },
  { href: '/notes', label: 'Journal', mobileLabel: 'Journal', icon: BookOpenText, glyph: 'journal' },
  { href: '/profile', label: 'Profile', mobileLabel: 'Profile', icon: CircleUserRound, glyph: 'profile' },
]

const HOST_NAV_ITEM = { href: '/host', label: 'Host', mobileLabel: 'Host', icon: Sparkles, glyph: 'host' }

export default function AppNav() {
  const { isLoggedIn, user } = useApp()
  const pathname = usePathname()
  const navItems = user?.role === 'host'
    ? [...NAV_ITEMS.slice(0, 2), HOST_NAV_ITEM, ...NAV_ITEMS.slice(2)]
    : NAV_ITEMS
  const isPublicPage = ['/', '/login', '/signup'].includes(pathname)

  if (isPublicPage || !isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 border-b border-[#9f927c] bg-[#fff8e8]/95">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="group flex items-center gap-2">
            <Leaf
              className="h-4 w-4 text-terracotta transition-transform duration-300 group-hover:rotate-12"
              strokeWidth={1.8}
            />
            <span className="font-serif text-base tracking-wide text-charcoal">Serendipity</span>
          </Link>
          {!isLoggedIn && (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="link-underline text-xs uppercase tracking-widest text-muted transition-colors duration-200 hover:text-charcoal"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="border border-charcoal bg-charcoal px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors duration-200 hover:bg-terracotta active:scale-95"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-[#9f927c] bg-[#fff8e8]/95 md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/home" className="group flex items-center gap-2">
            <Leaf
              className="h-4 w-4 text-terracotta transition-transform duration-300 group-hover:rotate-12"
              strokeWidth={1.8}
            />
            <span className="font-serif text-base tracking-wide text-charcoal">Serendipity</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            {navItems.map(({ href, label, icon: Icon, glyph }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 border px-3 py-2 text-[11px] uppercase tracking-widest transition-all duration-200 lg:px-4 lg:text-xs ${
                    active
                      ? 'border-charcoal bg-charcoal text-cream shadow-[2px_2px_0_#d6624b]'
                      : 'border-transparent text-muted hover:border-[#b8aa91] hover:text-charcoal'
                  }`}
                >
                  <span className={`nav-glyph nav-glyph--${glyph}`} aria-hidden="true">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <nav
        className="app-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-[#8f826d] bg-[#fff8e8] md:hidden"
        aria-label="Primary navigation"
      >
        <div className="flex px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1">
          {navItems.map(({ href, label, mobileLabel, icon: Icon, glyph }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[8px] uppercase tracking-[0.06em] transition-colors duration-200 ${
                  active ? 'text-[#293028]' : 'text-[#6d746b]'
                }`}
              >
                <span className={`nav-glyph nav-glyph--${glyph}`} aria-hidden="true">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={active ? 2.2 : 1.7} />
                </span>
                {mobileLabel}
                {active && (
                  <span
                    className="absolute bottom-1 h-0.5 w-5 rotate-[-2deg] bg-terracotta"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
