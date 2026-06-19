'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { StarRating } from '@/components/shared/StarRating'
import { useReaction } from '../hooks/useReaction'
import { useAuthStore } from '@/store/authStore'
import type { MediaType } from '@/types'

const LABELS: Record<MediaType, string> = {
  movie: 'ya la vi',
  series: 'ya la vi',
  song: 'ya la escuché',
  album: 'ya lo escuché',
  book: 'ya lo leí',
}

interface ReactionButtonProps {
  recommendationId: string
  mediaType: MediaType
  ownerId: string
}

export function ReactionButton({ recommendationId, mediaType, ownerId }: ReactionButtonProps) {
  const { user } = useAuthStore()
  const { reaction, allReactions, upsertReaction, removeReaction } = useReaction(recommendationId)
  const [showRating, setShowRating] = useState(false)

  // Don't show for your own recommendations
  if (!user || user.id === ownerId) return null

  const label = LABELS[mediaType]
  const hasReacted = !!reaction

  // Other users who reacted (not current user)
  const othersReacted = allReactions.filter(r => r.user.id !== user.id).slice(0, 3)

  function handleClick() {
    if (hasReacted) {
      removeReaction.mutate()
      setShowRating(false)
    } else {
      setShowRating(true)
    }
  }

  function handleRating(rating: number) {
    upsertReaction.mutate(rating)
    setShowRating(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Other reactions avatars */}
      {othersReacted.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {othersReacted.map(r => {
            const initials = r.user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={r.user.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 700, color: '#FDFAF7',
                }}>
                  {initials}
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: '#7A6B72' }}>
                  ★{r.rating}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: hasReacted ? '#B8D8C9' : 'rgba(184,216,201,0.2)',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600,
          color: hasReacted ? '#2D5A3A' : '#7A6B72',
          transition: 'all 0.2s',
        }}
      >
        <Check style={{ width: 12, height: 12 }} />
        {hasReacted ? `${label} ★${reaction.rating}` : label}
      </motion.button>

      {/* Rating picker */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
              background: '#FFFFFF', borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(45,36,38,0.14)',
              border: '1.5px solid rgba(201,184,232,0.3)',
              zIndex: 10, whiteSpace: 'nowrap',
            }}
          >
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#7A6B72', marginBottom: 8 }}>
              ¿cuánto te gustó?
            </p>
            <StarRating value={0} onChange={handleRating} size="md" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
