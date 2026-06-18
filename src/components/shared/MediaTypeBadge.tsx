import { cn } from '@/lib/utils'
import { type MediaType, MEDIA_TYPE_CONFIG } from '@/types'

interface MediaTypeBadgeProps {
  type: MediaType
  size?: 'sm' | 'md'
  className?: string
}

const TYPE_COLORS: Record<MediaType, { bg: string; text: string }> = {
  movie:  { bg: '#FDE8EE', text: '#E8849A' },
  song:   { bg: '#F0EBFF', text: '#9B8BC4' },
  album:  { bg: '#F0EBFF', text: '#9B8BC4' },
  series: { bg: '#FFF3E8', text: '#D4845A' },
  book:   { bg: '#E8F5EE', text: '#5A9B7A' },
}

export function MediaTypeBadge({ type, size = 'sm', className }: MediaTypeBadgeProps) {
  const config = MEDIA_TYPE_CONFIG[type]
  const colors = TYPE_COLORS[type]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-accent font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.02em',
      }}
    >
      <span role="img" aria-hidden="true">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
