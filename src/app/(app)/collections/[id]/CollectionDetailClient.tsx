'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FeedList } from '@/features/feed/components/FeedList'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { MoodTag } from '@/components/shared/MoodTag'
import type { Recommendation, Collection, MoodTag as MoodTagType } from '@/types'

interface RawCollectionItem {
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

function mapRec(item: RawCollectionItem): Recommendation {
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
    collectionIds: [],
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function useCollectionDetail(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch collection info
      const { data: col, error: colError } = await (supabase as any)
        .from('collections')
        .select('*')
        .eq('id', id)
        .single()
      if (colError) throw colError

      // Fetch collection items
      const { data: items, error: itemsError } = await (supabase as any)
        .from('collection_items')
        .select(`
          *,
          recommendation:recommendations!collection_items_recommendation_id_fkey(
            *,
            user:profiles!recommendations_user_id_fkey(*)
          )
        `)
        .eq('collection_id', id)
        .order('created_at', { ascending: false })
      if (itemsError) throw itemsError

      const collection: Collection = {
        id: col.id,
        userId: col.user_id,
        name: col.name,
        description: col.description ?? null,
        coverUrl: col.cover_url ?? null,
        moodTag: col.mood_tag ?? null,
        itemCount: col.item_count ?? (items?.length ?? 0),
        isPublic: col.is_public ?? true,
        createdAt: col.created_at ?? '',
      }

      const recommendations: Recommendation[] = ((items ?? []) as RawCollectionItem[])
        .filter((item) => item.recommendation)
        .map(mapRec)

      return { collection, recommendations }
    },
    enabled: !!id,
  })
}

interface CollectionDetailClientProps {
  id: string
}

export function CollectionDetailClient({ id }: CollectionDetailClientProps) {
  const router = useRouter()
  const { data, isLoading } = useCollectionDetail(id)

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDFAF7' }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(201,184,232,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div className="shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div className="shimmer" style={{ height: 20, width: 150, borderRadius: 8 }} />
        </div>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 2 }).map((_, i) => <FeedCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          illustration="collections"
          headline="colección no encontrada"
          action={{ label: 'volver', href: '/profile' }}
        />
      </div>
    )
  }

  const { collection, recommendations } = data

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', background: '#FDFAF7' }}
    >
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(253,250,247,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,184,232,0.2)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(45,36,38,0.06)',
            border: 'none', cursor: 'pointer',
          }}
          aria-label="volver"
        >
          <ArrowLeft style={{ width: 16, height: 16, color: '#2D2426' }} />
        </motion.button>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.3rem',
          fontWeight: 400,
          color: '#2D2426',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {collection.name}
        </h1>
      </header>

      {/* Collection meta */}
      <div style={{ padding: '20px 20px 12px' }}>
        {collection.moodTag && (
          <div style={{ marginBottom: 10 }}>
            <MoodTag tag={collection.moodTag as MoodTagType} size="md" />
          </div>
        )}
        {collection.description && (
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: '#7A6B72',
            lineHeight: 1.5,
            marginBottom: 8,
          }}>
            {collection.description}
          </p>
        )}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: '#B8A8B0',
        }}>
          {recommendations.length} {recommendations.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Items */}
      <div style={{ paddingBottom: 100 }}>
        {recommendations.length === 0 ? (
          <EmptyState
            illustration="collections"
            headline="esta colección está vacía"
            subtext="agrega recomendaciones para llenarla"
            className="mt-8"
          />
        ) : (
          <FeedList recommendations={recommendations} />
        )}
      </div>
    </motion.div>
  )
}
