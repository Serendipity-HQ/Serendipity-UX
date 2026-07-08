import Link from "next/link";
import { Compass } from "lucide-react";

const nav = [
  ["Explore", "/explore"],
  ["This Week", "/this-week"],
  ["Submit", "/submit"],
  ["Profile", "/profile"],
  ["Admin", "/admin"],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper-soft/82 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-night text-paper">
            <Compass className="h-4 w-4" />
          </span>
          <span className="serif text-2xl font-semibold tracking-tight">Serendipity</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="quiet-button bg-night text-paper">
          Sign in
        </Link>
      </div>
    </header>
  );
}
