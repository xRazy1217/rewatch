'use client'

import { motion } from 'framer-motion'
import { FeedCard } from './FeedCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Recommendation } from '@/types'

interface FeedListProps {
  recommendations: Recommendation[]
  isLoading?: boolean
  lastCardRef?: (node: HTMLDivElement | null) => void
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onComment?: (id: string) => void
}

const listVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
}

export function FeedList({
  recommendations,
  isLoading = false,
  lastCardRef,
  onLike,
  onSave,
  onComment,
}: FeedListProps) {
  if (!isLoading && recommendations.length === 0) {
    return (
      <EmptyState
        illustration="feed"
        headline="tu feed está esperando algo bonito"
        subtext="sigue a personas para ver sus recomendaciones aquí"
        action={{ label: 'explorar usuarios', href: '/discover' }}
        className="mt-12"
      />
    )
  }

  return (
    <motion.div
      variants={listVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-4 px-4"
    >
      {recommendations.map((rec, i) => {
        const isLast = i === recommendations.length - 1
        return (
          <div key={rec.id} ref={isLast ? lastCardRef : undefined}>
            <FeedCard
              recommendation={rec}
              onLike={onLike}
              onSave={onSave}
              onComment={onComment}
            />
          </div>
        )
      })}
    </motion.div>
  )
}
