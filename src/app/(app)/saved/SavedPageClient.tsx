'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedList } from '@/features/feed/components/FeedList'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'
import type { Recommendation } from '@/types'

interface RawSavedItem {
  recommendation: {
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
}

function mapRow(item: RawSavedItem): Recommendation {
  const row = item.recommendation
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
    isSaved: true,
    collectionIds: [],
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function useSavedItems(userId: string) {
  return useQuery({
    queryKey: ['saved', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('saved_items')
        .select(`
          *,
          recommendation:recommendations!saved_items_recommendation_id_fkey(
            *,
            user:profiles!recommendations_user_id_fkey(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return ((data ?? []) as unknown as RawSavedItem[])
        .filter((item) => item.recommendation)
        .map(mapRow)
    },
    enabled: !!userId,
  })
}

export function SavedPageClient() {
  const { user } = useAuthStore()
  const { data: saved, isLoading } = useSavedItems(user?.id ?? '')

  return (
    <PageTransition>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b px-5 py-4"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#2D2426',
          }}
        >
          guardado
        </motion.h1>
      </header>

      <div className="pb-24 pt-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
        ) : !saved || saved.length === 0 ? (
          <EmptyState
            illustration="saves"
            headline="guarda las cosas que te mueven"
            subtext="toca el marcador en cualquier post para guardarlo aquí"
            action={{ label: 'ver el feed', href: '/feed' }}
            className="mt-12"
          />
        ) : (
          <FeedList recommendations={saved} />
        )}
      </div>
    </PageTransition>
  )
}
