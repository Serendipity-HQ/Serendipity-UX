'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  fade?: boolean
  className?: string
}

export default function Reveal({ children, delay = 0, fade = false, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`
          el.classList.add('visible')
          obs.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${fade ? 'reveal-fade' : 'reveal'} ${className}`}>
      {children}
    </div>
  )
}
