import type { ReactNode } from 'react'

type StampTone = 'ink' | 'terracotta' | 'sage' | 'cobalt' | 'cream'

const tones: Record<StampTone, string> = {
  ink: 'stamp-ink',
  terracotta: 'stamp-terracotta',
  sage: 'stamp-sage',
  cobalt: 'stamp-cobalt',
  cream: 'stamp-cream',
}

export default function StampMark({
  children,
  tone = 'ink',
  shape = 'rect',
  className = '',
}: {
  children: ReactNode
  tone?: StampTone
  shape?: 'rect' | 'round'
  className?: string
}) {
  return (
    <span className={`stamp-mark ${tones[tone]} ${shape === 'round' ? 'stamp-round' : ''} ${className}`}>
      {children}
    </span>
  )
}
