'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle, Bookmark, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/shared/StarRating'
import { MediaTypeBadge } from '@/components/shared/MediaTypeBadge'
import { MoodTagList } from '@/components/shared/MoodTag'
import { EmptyState } from '@/components/shared/EmptyState'
import { CommentSheet } from '@/features/social/components/CommentSheet'
import { useLike } from '@/features/social/hooks/useLike'
import { useSave } from '@/features/social/hooks/useSave'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime, formatCount } from '@/lib/utils'
import type { Recommendation } from '@/types'

interface RawRecommendation {
  id: string
  user_id: string
  type: string
  title: string
  subtitle: string | null
  description: string | null
  cover_url: string
  rating: number | null
  mood_tags: string[] | null
  source: string
  external_id: string | null
  external_metadata: Record<string, unknown> | null
  likes_count: number | null
  comments_count: number | null
  saves_count: number | null
  is_public: boolean | null
  created_at: string | null
  updated_at: string | null
  user: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    bio: string | null
    followers_count: number | null
    following_count: number | null
    created_at: string | null
  }
}

function mapRow(row: RawRecommendation): Recommendation {
  return {
    id: row.id,
    userId: row.user_id,
    user: {
      id: row.user.id,
      username: row.user.username,
      displayName: row.user.display_name,
      avatarUrl: row.user.avatar_url,
      bio: row.user.bio,
      favoriteMedia: [],
      followersCount: row.user.followers_count ?? 0,
      followingCount: row.user.following_count ?? 0,
      createdAt: row.user.created_at ?? '',
    },
    type: row.type as Recommendation['type'],
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    coverUrl: row.cover_url,
    rating: row.rating ?? 0,
    moodTags: (row.mood_tags ?? []) as Recommendation['moodTags'],
    source: row.source as Recommendation['source'],
    externalId: row.external_id,
    externalMetadata: (row.external_metadata ?? {}) as Recommendation['externalMetadata'],
    likesCount: row.likes_count ?? 0,
    commentsCount: row.comments_count ?? 0,
    savesCount: row.saves_count ?? 0,
    isPublic: row.is_public ?? true,
    collectionIds: [],
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function useRecommendationById(id: string) {
  return useQuery({
    queryKey: ['recommendation', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('recommendations')
        .select(`
          *,
          user:profiles!recommendations_user_id_fkey (
            id, username, display_name, avatar_url, bio,
            followers_count, following_count, created_at
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null
      return mapRow(data as unknown as RawRecommendation)
    },
    enabled: !!id,
  })
}

function ExternalLinkButton({ recommendation }: { recommendation: Recommendation }) {
  const { source, externalMetadata } = recommendation
  let href: string | null = null
  let label: string | null = null
  let pillStyle: React.CSSProperties = {}

  if (source === 'spotify' && externalMetadata?.spotifyUrl) {
    href = externalMetadata.spotifyUrl
    label = '▶ Escuchar en Spotify'
    pillStyle = {
      background: 'rgba(29,185,84,0.10)',
      color: '#1DB954',
      border: '1.5px solid rgba(29,185,84,0.35)',
    }
  } else if (source === 'tmdb' && externalMetadata?.tmdbUrl) {
    href = externalMetadata.tmdbUrl
    label = '🎬 Ver en TMDB'
    pillStyle = {
      background: 'rgba(1,180,228,0.08)',
      color: '#01b4e4',
      border: '1.5px solid rgba(1,180,228,0.3)',
    }
  } else if (source === 'google_books' && externalMetadata?.openLibraryUrl) {
    href = externalMetadata.openLibraryUrl
    label = '📖 Open Library'
    pillStyle = {
      background: 'rgba(201,184,232,0.15)',
      color: '#7A5C8A',
      border: '1.5px solid rgba(201,184,232,0.4)',
    }
  }

  if (!href || !label) return null

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        ...pillStyle,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 20,
        padding: '8px 16px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      <ExternalLink style={{ width: 13, height: 13 }} />
      {label}
    </motion.a>
  )
}

function DetailSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF7' }}>
      <div className="shimmer" style={{ width: '100%', aspectRatio: '1/1' }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="shimmer" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="shimmer" style={{ height: 13, width: '50%', borderRadius: 6 }} />
            <div className="shimmer" style={{ height: 11, width: '30%', borderRadius: 6 }} />
          </div>
        </div>
        <div className="shimmer" style={{ height: 28, width: '80%', borderRadius: 8 }} />
        <div className="shimmer" style={{ height: 16, width: '50%', borderRadius: 6 }} />
        <div className="shimmer" style={{ height: 14, width: '100%', borderRadius: 6 }} />
        <div className="shimmer" style={{ height: 14, width: '90%', borderRadius: 6 }} />
        <div className="shimmer" style={{ height: 14, width: '70%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

interface RecommendationDetailProps {
  id: string
}

export function RecommendationDetail({ id }: RecommendationDetailProps) {
  const router = useRouter()
  const { data: rec, isLoading } = useRecommendationById(id)
  const { user } = useAuthStore()

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const likeMutation = useLike()
  const saveMutation = useSave()

  // Sync state when data arrives
  const [synced, setSynced] = useState(false)
  if (rec && !synced) {
    setLiked(rec.isLiked ?? false)
    setSaved(rec.isSaved ?? false)
    setLikesCount(rec.likesCount)
    setSynced(true)
  }

  function handleLike() {
    if (!rec) return
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((c) => newLiked ? c + 1 : c - 1)
    if (user) likeMutation.mutate({ recommendationId: rec.id, liked: newLiked })
  }

  function handleSave() {
    if (!rec) return
    const newSaved = !saved
    setSaved(newSaved)
    if (newSaved) {
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 2000)
    }
    if (user) saveMutation.mutate({ recommendationId: rec.id, saved: newSaved })
  }

  if (isLoading) return <DetailSkeleton />

  if (!rec) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          illustration="feed"
          headline="recomendación no encontrada"
          subtext="puede que haya sido eliminada"
          action={{ label: 'volver al feed', href: '/feed' }}
        />
      </div>
    )
  }

  const { user: recUser } = rec
  const avatarFallback = recUser.displayName
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ minHeight: '100vh', background: '#FDFAF7' }}
      >
        {/* Hero image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
          {rec.coverUrl ? (
            <Image
              src={rec.coverUrl}
              alt={rec.title}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem',
                background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)',
              }}
            >
              {rec.type === 'movie' ? '🎬' :
               rec.type === 'song' ? '🎵' :
               rec.type === 'album' ? '💿' :
               rec.type === 'series' ? '📺' : '📖'}
            </div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(to top, rgba(45,36,38,0.6) 0%, transparent 100%)',
              borderRadius: '0 0 24px 24px',
            }}
          />

          {/* Back button */}
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(255,248,245,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 20,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              zIndex: 5,
            }}
            aria-label="volver"
          >
            <ArrowLeft style={{ width: 16, height: 16, color: '#2D2426' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#2D2426', fontWeight: 500 }}>
              volver
            </span>
          </motion.button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ padding: '20px 20px 100px' }}
        >
          {/* User row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              {recUser.avatarUrl ? (
                <Image src={recUser.avatarUrl} alt={recUser.displayName} fill sizes="40px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600, color: '#FDFAF7',
                }}>
                  {avatarFallback}
                </div>
              )}
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: '#2D2426', lineHeight: 1.2 }}>
                {recUser.displayName}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#B8A8B0', lineHeight: 1.2 }}>
                @{recUser.username} · {formatRelativeTime(rec.createdAt)}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#2D2426',
            lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {rec.title}
          </h1>

          {/* Subtitle */}
          {rec.subtitle && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: '#7A6B72',
              marginBottom: 12,
            }}>
              {rec.subtitle}
            </p>
          )}

          {/* Rating + badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <StarRating value={rec.rating} readonly size="lg" />
            <MediaTypeBadge type={rec.type} size="md" />
          </div>

          {/* Description */}
          {rec.description && (
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              color: '#7A6B72',
              fontStyle: 'italic',
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              &ldquo;{rec.description}&rdquo;
            </p>
          )}

          {/* Mood tags */}
          {rec.moodTags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MoodTagList tags={rec.moodTags} size="md" />
            </div>
          )}

          {/* External link */}
          <div style={{ marginBottom: 20 }}>
            <ExternalLinkButton recommendation={rec} />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(201,184,232,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Like */}
              <motion.button
                onClick={handleLike}
                animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                }}
                aria-label={liked ? 'quitar like' : 'dar like'}
                aria-pressed={liked}
              >
                <Heart
                  style={{
                    width: 22, height: 22,
                    color: liked ? '#F4A7B9' : '#B8A8B0',
                    fill: liked ? '#F4A7B9' : 'none',
                    transition: 'all 0.2s',
                  }}
                  strokeWidth={liked ? 0 : 1.5}
                />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: liked ? '#F4A7B9' : '#B8A8B0' }}>
                  {formatCount(likesCount)}
                </span>
              </motion.button>

              {/* Comment */}
              <motion.button
                onClick={() => setShowComments(true)}
                whileTap={{ scale: 0.9 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                }}
                aria-label="comentar"
              >
                <MessageCircle style={{ width: 22, height: 22, color: '#B8A8B0' }} strokeWidth={1.5} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#B8A8B0' }}>
                  {formatCount(rec.commentsCount)}
                </span>
              </motion.button>
            </div>

            {/* Save */}
            <div style={{ position: 'relative' }}>
              <AnimatePresence>
                {showSaveConfirm && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    style={{
                      position: 'absolute', right: 0, top: -32,
                      whiteSpace: 'nowrap', fontSize: 11, fontWeight: 500,
                      padding: '4px 8px', borderRadius: 20,
                      background: '#B8D8C9', color: '#2D5A3A',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    guardado ♡
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                aria-label={saved ? 'quitar guardado' : 'guardar'}
                aria-pressed={saved}
              >
                <Bookmark
                  style={{
                    width: 22, height: 22,
                    color: saved ? '#C9B8E8' : '#B8A8B0',
                    fill: saved ? '#C9B8E8' : 'none',
                    transition: 'all 0.2s',
                  }}
                  strokeWidth={saved ? 0 : 1.5}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <CommentSheet
        recommendationId={rec.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  )
}
