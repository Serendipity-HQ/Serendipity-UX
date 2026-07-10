import { LANE_LABELS } from '@/lib/constants'
import type { Lane } from '@/lib/types'

const COLORS: Record<Lane, string> = {
  passion: 'bg-[#E6A09A] text-[#15251E] border border-white/10',
  growth:  'bg-[#7FA17E] text-[#15251E] border border-white/10',
  surprise:'bg-[#B8AACD] text-[#15251E] border border-white/10',
}

export default function LaneBadge({ lane, size = 'sm' }: { lane: Lane; size?: 'sm' | 'xs' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-widest uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ${COLORS[lane]} ${
        size === 'xs' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-3 py-1'
      }`}
    >
      {LANE_LABELS[lane]}
    </span>
  )
}
