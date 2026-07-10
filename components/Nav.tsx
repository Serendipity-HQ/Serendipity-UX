'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, BookOpen, Users, User, Leaf } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const NAV_ITEMS = [
  { href: '/home',     label: 'Home',    icon: Home },
  { href: '/discover', label: 'Discover',icon: Compass },
  { href: '/notes',    label: 'Journal',  icon: BookOpen },
  { href: '/people',   label: 'People',  icon: Users },
  { href: '/profile',  label: 'Profile', icon: User },
]

export default function Nav() {
  const pathname = usePathname()
  const { isLoggedIn } = useApp()

  const isPublicPage = ['/', '/login', '/signup'].includes(pathname)

  if (isPublicPage || !isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 bg-white/8 backdrop-blur-2xl border-b border-white/14">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Leaf className="w-4 h-4 text-[#F8E1C5] transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.5} />
            <span className="font-serif text-base tracking-wide text-charcoal">Serendipity</span>
          </Link>
          {!isLoggedIn && (
            <div className="flex items-center gap-5">
              <Link href="/login" className="text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors duration-200 link-underline">
                Sign in
              </Link>
              <Link href="/signup" className="text-xs tracking-widest uppercase bg-charcoal text-cream px-5 py-2.5 rounded-full hover:bg-charcoal/85 transition-colors duration-200 active:scale-95">
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
      {/* Desktop top nav */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/8 backdrop-blur-2xl border-b border-white/14">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <Leaf className="w-4 h-4 text-[#F8E1C5] transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.5} />
            <span className="font-serif text-base tracking-wide text-charcoal">Serendipity</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-200 ${
                    active ? 'bg-white/18 text-cream shadow-sm border border-white/16' : 'text-muted hover:text-charcoal hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/8 backdrop-blur-2xl border-t border-white/14">
        <div className="flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] tracking-widest uppercase transition-colors duration-200 ${
                  active ? 'text-[#F8E1C5]' : 'text-muted'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
