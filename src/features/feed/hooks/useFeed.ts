'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Recommendation } from '@/types'

const PAGE_SIZE = 10

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

async function fetchFeed({ pageParam = 0 }: { pageParam: number }) {
  const supabase = createClient()
  const from = pageParam * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      user:profiles!recommendations_user_id_fkey (
        id, username, display_name, avatar_url, bio,
        followers_count, following_count, created_at
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return ((data ?? []) as unknown as RawRecommendation[]).map(mapRow)
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  })
}
