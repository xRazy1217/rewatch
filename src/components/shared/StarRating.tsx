'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

function Star({
  filled,
  half,
  index,
  size,
  readonly,
  onHover,
  onClick,
}: {
  filled: boolean
  half: boolean
  index: number
  size: 'sm' | 'md' | 'lg'
  readonly: boolean
  onHover?: (value: number) => void
  onClick?: (value: number) => void
}) {
  return (
    <motion.button
      type="button"
      disabled={readonly}
      whileHover={readonly ? {} : { scale: 1.2 }}
      whileTap={readonly ? {} : { scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onMouseEnter={() => !readonly && onHover?.(index + 1)}
      onClick={() => !readonly && onClick?.(index + 1)}
      className={cn(
        'relative focus:outline-none',
        !readonly && 'cursor-pointer',
        readonly && 'cursor-default'
      )}
      aria-label={`${index + 1} estrella${index + 1 > 1 ? 's' : ''}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(SIZE_MAP[size], 'transition-all duration-150')}
        fill={filled || half ? '#F4A7B9' : 'none'}
        stroke={filled || half ? '#F4A7B9' : '#C9B8E8'}
        strokeWidth={1.5}
      >
        {half ? (
          <>
            <defs>
              <linearGradient id={`half-${index}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#F4A7B9" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              fill={`url(#half-${index})`}
            />
          </>
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        )}
      </svg>
    </motion.button>
  )
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={() => setHoverValue(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = displayValue >= i + 1
        const half = !filled && displayValue >= i + 0.5
        return (
          <Star
            key={i}
            index={i}
            filled={filled}
            half={half}
            size={size}
            readonly={readonly}
            onHover={setHoverValue}
            onClick={onChange}
          />
        )
      })}
    </div>
  )
}
