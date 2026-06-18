'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type MoodTag as MoodTagType, MOOD_TAG_CONFIG } from '@/types'

interface MoodTagProps {
  tag: MoodTagType
  selected?: boolean
  onToggle?: (tag: MoodTagType) => void
  size?: 'sm' | 'md'
  className?: string
}

export function MoodTag({
  tag,
  selected = false,
  onToggle,
  size = 'md',
  className,
}: MoodTagProps) {
  const config = MOOD_TAG_CONFIG[tag]
  const isInteractive = !!onToggle

  return (
    <motion.button
      type="button"
      onClick={() => onToggle?.(tag)}
      disabled={!isInteractive}
      whileHover={isInteractive ? { scale: 1.05 } : {}}
      whileTap={isInteractive ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-accent font-medium transition-all duration-200',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        selected
          ? 'text-[#7A5C8A]'
          : 'text-[#7A6B72]',
        isInteractive ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      style={{
        backgroundColor: selected ? '#C9B8E8' : '#F0EBFF',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.01em',
      }}
      aria-pressed={isInteractive ? selected : undefined}
    >
      <span role="img" aria-hidden="true">{config.emoji}</span>
      <span>{config.label}</span>
    </motion.button>
  )
}

interface MoodTagListProps {
  tags: MoodTagType[]
  selectedTags?: MoodTagType[]
  onToggle?: (tag: MoodTagType) => void
  size?: 'sm' | 'md'
  className?: string
}

export function MoodTagList({
  tags,
  selectedTags = [],
  onToggle,
  size = 'md',
  className,
}: MoodTagListProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <MoodTag
          key={tag}
          tag={tag}
          selected={selectedTags.includes(tag)}
          onToggle={onToggle}
          size={size}
        />
      ))}
    </div>
  )
}
