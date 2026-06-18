'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatCount } from '@/lib/utils'
import { StarRating } from '@/components/shared/StarRating'
import { MoodTag } from '@/components/shared/MoodTag'
import { MediaTypeBadge } from '@/components/shared/MediaTypeBadge'
import { useLike } from '@/features/social/hooks/useLike'
import { useSave } from '@/features/social/hooks/useSave'
import { useAuthStore } from '@/store/authStore'
import { CommentSheet } from '@/features/social/components/CommentSheet'
import type { Recommendation } from '@/types'

interface FeedCardProps {
  recommendation: Recommendation
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onComment?: (id: string) => void
  className?: string
}

export function FeedCard({
  recommendation,
  onLike,
  onSave,
  onComment,
  className,
}: FeedCardProps) {
  const [liked, setLiked] = useState(recommendation.isLiked ?? false)
  const [saved, setSaved] = useState(recommendation.isSaved ?? false)
  const [likesCount, setLikesCount] = useState(recommendation.likesCount)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const { user } = useAuthStore()
  const likeMutation = useLike()
  const saveMutation = useSave()

  function handleLike() {
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((c) => newLiked ? c + 1 : c - 1)
    onLike?.(recommendation.id)
    if (user) {
      likeMutation.mutate({ recommendationId: recommendation.id, liked: newLiked })
    }
  }

  function handleSave() {
    const newSaved = !saved
    setSaved(newSaved)
    if (newSaved) {
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 2000)
    }
    onSave?.(recommendation.id)
    if (user) {
      saveMutation.mutate({ recommendationId: recommendation.id, saved: newSaved })
    }
  }

  const { user: recUser } = recommendation

  const avatarFallback = recUser.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn('relative', className)}
      >
        <div
          className="rounded-[20px] overflow-hidden"
          style={{
            background: '#FFF8F5',
            boxShadow: '0 2px 16px rgba(45,36,38,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                {recUser.avatarUrl ? (
                  <Image
                    src={recUser.avatarUrl}
                    alt={recUser.displayName}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                      color: '#FDFAF7',
                    }}
                  >
                    {avatarFallback}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}
                >
                  {recUser.displayName}
                </p>
                <p
                  className="text-[11px] leading-tight"
                  style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}
                >
                  @{recUser.username} · {formatRelativeTime(recommendation.createdAt)}
                </p>
              </div>
            </div>

            <button
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
              aria-label="más opciones"
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: '#B8A8B0' }} />
            </button>
          </div>

          {/* Review snippet */}
          {recommendation.description && (
            <div className="px-4 pb-3">
              <p
                className="text-sm leading-relaxed line-clamp-2"
                style={{
                  color: '#7A6B72',
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{recommendation.description}&rdquo;
              </p>
            </div>
          )}

          {/* Media card */}
          <div className="px-4 pb-3">
            <div
              className="flex gap-3 p-3 rounded-2xl"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 8px rgba(45,36,38,0.04)' }}
            >
              {/* Cover */}
              <div
                className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: '#FDE8EE' }}
              >
                {recommendation.coverUrl ? (
                  <Image
                    src={recommendation.coverUrl}
                    alt={recommendation.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)' }}
                  >
                    {recommendation.type === 'movie' ? '🎬' :
                     recommendation.type === 'song' ? '🎵' :
                     recommendation.type === 'album' ? '💿' :
                     recommendation.type === 'series' ? '📺' : '📖'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3
                    className="font-semibold text-sm leading-snug line-clamp-2"
                    style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}
                  >
                    {recommendation.title}
                  </h3>
                  {recommendation.subtitle && (
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: '#7A6B72', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {recommendation.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <StarRating value={recommendation.rating} readonly size="sm" />
                  <MediaTypeBadge type={recommendation.type} />
                </div>
              </div>
            </div>
          </div>

          {/* Mood tags */}
          {recommendation.moodTags.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {recommendation.moodTags.slice(0, 3).map((tag) => (
                <MoodTag key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'rgba(201,184,232,0.2)' }}
          >
            <div className="flex items-center gap-4">
              {/* Like */}
              <motion.button
                type="button"
                onClick={handleLike}
                animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-1.5 group"
                aria-label={liked ? 'quitar like' : 'dar like'}
                aria-pressed={liked}
              >
                <motion.div
                  animate={liked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  <Heart
                    className="w-5 h-5 transition-all duration-200"
                    style={{
                      color: liked ? '#F4A7B9' : '#B8A8B0',
                      fill: liked ? '#F4A7B9' : 'none',
                    }}
                    strokeWidth={liked ? 0 : 1.5}
                  />
                </motion.div>
                <span
                  className="text-xs font-medium transition-colors"
                  style={{
                    color: liked ? '#F4A7B9' : '#B8A8B0',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {formatCount(likesCount)}
                </span>
              </motion.button>

              {/* Comment */}
              <button
                type="button"
                onClick={() => {
                  setShowComments(true)
                  onComment?.(recommendation.id)
                }}
                className="flex items-center gap-1.5"
                aria-label="comentar"
              >
                <MessageCircle
                  className="w-5 h-5"
                  style={{ color: '#B8A8B0' }}
                  strokeWidth={1.5}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {formatCount(recommendation.commentsCount)}
                </span>
              </button>
            </div>

            {/* Save */}
            <div className="relative">
              <AnimatePresence>
                {showSaveConfirm && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    className="absolute right-0 -top-8 whitespace-nowrap text-[11px] font-medium px-2 py-1 rounded-full"
                    style={{
                      background: '#B8D8C9',
                      color: '#2D5A3A',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    guardado ♡
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={handleSave}
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                aria-label={saved ? 'quitar guardado' : 'guardar'}
                aria-pressed={saved}
              >
                <Bookmark
                  className="w-5 h-5 transition-all duration-200"
                  style={{
                    color: saved ? '#C9B8E8' : '#B8A8B0',
                    fill: saved ? '#C9B8E8' : 'none',
                  }}
                  strokeWidth={saved ? 0 : 1.5}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.article>

      <CommentSheet
        recommendationId={recommendation.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  )
}
