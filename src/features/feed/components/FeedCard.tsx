'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Bookmark, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatCount } from '@/lib/utils'
import { StarRating } from '@/components/shared/StarRating'
import { MoodTag } from '@/components/shared/MoodTag'
import { MediaTypeBadge } from '@/components/shared/MediaTypeBadge'
import { useLike } from '@/features/social/hooks/useLike'
import { useSave } from '@/features/social/hooks/useSave'
import { useAuthStore } from '@/store/authStore'
import { CommentSheet } from '@/features/social/components/CommentSheet'
import { RecommendationMenu } from '@/features/recommendations/components/RecommendationMenu'
import { ReactionButton } from '@/features/social/components/ReactionButton'
import type { Recommendation } from '@/types'

interface FeedCardProps {
  recommendation: Recommendation
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onComment?: (id: string) => void
  onDeleted?: () => void
  className?: string
}

function ExternalLinkPill({ recommendation }: { recommendation: Recommendation }) {
  const { source, externalMetadata, title, subtitle } = recommendation

  let href: string | null = null
  let label: string | null = null
  let pillStyle: React.CSSProperties = {}

  if (source === 'spotify' && (externalMetadata?.spotifyUrl || title)) {
    // Build Spotify search URL from title + artist
    const searchTerm = subtitle ? `${title} ${subtitle}` : title
    href = (externalMetadata?.spotifyUrl as string) || `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`
    label = '▶ Spotify'
    pillStyle = {
      background: 'rgba(29,185,84,0.10)',
      color: '#1DB954',
      border: '1px solid rgba(29,185,84,0.3)',
    }
  } else if (source === 'tmdb' && externalMetadata?.tmdbUrl) {
    href = externalMetadata.tmdbUrl
    label = '🎬 TMDB'
    pillStyle = {
      background: 'rgba(1,180,228,0.08)',
      color: '#01b4e4',
      border: '1px solid rgba(1,180,228,0.3)',
    }
  } else if (source === 'google_books' && externalMetadata?.openLibraryUrl) {
    href = externalMetadata.openLibraryUrl
    label = '📖 Open Library'
    pillStyle = {
      background: 'rgba(201,184,232,0.15)',
      color: '#7A5C8A',
      border: '1px solid rgba(201,184,232,0.4)',
    }
  }

  if (!href || !label) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full hover:scale-[1.04] active:scale-95 transition-transform duration-150"
      style={{
        ...pillStyle,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        textDecoration: 'none',
        marginTop: 4,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink style={{ width: 10, height: 10 }} />
      {label}
    </a>
  )
}

function FeedCardComponent({
  recommendation,
  onLike,
  onSave,
  onComment,
  onDeleted,
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
      <article className={cn('relative', className)}>
        <div
          className="rounded-[20px] overflow-hidden"
          style={{
            background: '#FFF8F5',
            boxShadow: '0 2px 16px rgba(45,36,38,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <Link href={`/profile/${recUser.username}`} className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
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
            </Link>

            <RecommendationMenu
              recommendationId={recommendation.id}
              userId={recommendation.userId}
              onDeleted={onDeleted}
            />
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

          {/* Media card — clickable */}
          <div className="px-4 pb-3">
            <Link href={`/r/${recommendation.id}`} style={{ textDecoration: 'none', display: 'block' }}>
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

                  {/* External link pill */}
                  <ExternalLinkPill recommendation={recommendation} />
                </div>
              </div>
            </Link>
          </div>

          {/* Mood tags */}
          {recommendation.moodTags.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {recommendation.moodTags.slice(0, 3).map((tag) => (
                <MoodTag key={tag} tag={tag} size="sm" />
              ))}
            </div>
          )}

          {/* Reaction — "ya lo vi/escuché/leí" */}
          <div className="px-4 pb-3">
            <ReactionButton
              recommendationId={recommendation.id}
              mediaType={recommendation.type}
              ownerId={recommendation.userId}
            />
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'rgba(201,184,232,0.2)' }}
          >
            <div className="flex items-center gap-4">
              {/* Like */}
              <button
                type="button"
                onClick={handleLike}
                className="flex items-center gap-1.5 group active:scale-95 transition-transform duration-150"
                aria-label={liked ? 'quitar like' : 'dar like'}
                aria-pressed={liked}
              >
                <Heart
                  className="w-5 h-5 transition-all duration-200"
                  style={{
                    color: liked ? '#F4A7B9' : '#B8A8B0',
                    fill: liked ? '#F4A7B9' : 'none',
                  }}
                  strokeWidth={liked ? 0 : 1.5}
                />
                <span
                  className="text-xs font-medium transition-colors"
                  style={{
                    color: liked ? '#F4A7B9' : '#B8A8B0',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {formatCount(likesCount)}
                </span>
              </button>

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
              {showSaveConfirm && (
                <span
                  className="absolute right-0 -top-8 whitespace-nowrap text-[11px] font-medium px-2 py-1 rounded-full animate-scale-in"
                  style={{
                    background: '#B8D8C9',
                    color: '#2D5A3A',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  guardado ♡
                </span>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="active:scale-110 transition-transform duration-150"
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
              </button>
            </div>
          </div>
        </div>
      </article>

      <CommentSheet
        recommendationId={recommendation.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  )
}

export const FeedCard = memo(FeedCardComponent)
