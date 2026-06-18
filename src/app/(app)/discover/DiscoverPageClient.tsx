'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedList } from '@/features/feed/components/FeedList'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { FollowButton } from '@/features/social/components/FollowButton'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/lib/supabase/client'
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

interface UserResult {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

const TABS = ['para ti', 'personas'] as const
type Tab = typeof TABS[number]

export function DiscoverPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>('para ti')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const tabsRef = useRef<HTMLDivElement>(null)

  // Public feed query
  const { data: publicFeed, isLoading: feedLoading } = useQuery({
    queryKey: ['discover-feed'],
    queryFn: async () => {
      const supabase = createClient()
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
        .limit(20)
      if (error) throw error
      return ((data ?? []) as unknown as RawRecommendation[]).map(mapRow)
    },
    enabled: activeTab === 'para ti',
  })

  // User search query
  const { data: userResults, isLoading: usersLoading } = useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .ilike('username', `%${debouncedQuery}%`)
        .limit(10)
      if (error) throw error
      return (data ?? []) as UserResult[]
    },
    enabled: !!debouncedQuery.trim() && activeTab === 'personas',
  })

  return (
    <PageTransition>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <div style={{ padding: '16px 20px 0' }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '1.5rem',
              color: '#2D2426',
              fontWeight: 400,
              marginBottom: 12,
            }}
          >
            descubrir
          </h1>

          {/* Tabs */}
          <div ref={tabsRef} style={{ display: 'flex', gap: 24, position: 'relative' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 0 12px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2D2426' : '#B8A8B0',
                    position: 'relative',
                    transition: 'color 0.2s',
                  }}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'para ti' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-4 pb-4">
              {feedLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px' }}>
                  {[0, 1, 2].map((i) => <FeedCardSkeleton key={i} />)}
                </div>
              ) : !publicFeed || publicFeed.length === 0 ? (
                <EmptyState
                  illustration="discover"
                  headline="nada por aquí todavía"
                  subtext="sé la primera en compartir algo"
                  action={{ label: 'crear recomendación', href: '/create' }}
                  className="mt-12"
                />
              ) : (
                <FeedList recommendations={publicFeed} />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="people"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search input */}
            <div style={{ padding: '16px 20px 8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 20,
                  background: '#FFF8F5',
                  border: '1.5px solid rgba(201,184,232,0.4)',
                }}
              >
                <Search style={{ width: 16, height: 16, color: '#B8A8B0', flexShrink: 0 }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="busca por nombre de usuario"
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9rem',
                    color: '#2D2426',
                  }}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Results */}
            <div style={{ padding: '8px 0 16px' }}>
              {!debouncedQuery.trim() ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 20px',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🔍</span>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.9rem',
                      color: '#7A6B72',
                      textAlign: 'center',
                    }}
                  >
                    busca por nombre de usuario
                  </p>
                </div>
              ) : usersLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 20px' }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 16,
                        background: '#FFF8F5',
                      }}
                    >
                      <div className="shimmer" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="shimmer" style={{ height: 12, width: '50%', borderRadius: 6 }} />
                        <div className="shimmer" style={{ height: 10, width: '35%', borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !userResults || userResults.length === 0 ? (
                <EmptyState
                  illustration="discover"
                  headline="sin resultados"
                  subtext={`no encontramos "@${debouncedQuery}"`}
                  className="mt-8"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
                  {userResults.map((u, i) => {
                    const avatarFallback = u.display_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          borderRadius: 16,
                          background: '#FFF8F5',
                          boxShadow: '0 1px 8px rgba(45,36,38,0.04)',
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                          }}
                        >
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.display_name}
                              fill
                              sizes="44px"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#FDFAF7',
                              }}
                            >
                              {avatarFallback}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#2D2426',
                              margin: 0,
                            }}
                          >
                            {u.display_name}
                          </p>
                          <p
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '0.75rem',
                              color: '#B8A8B0',
                              margin: '1px 0 0',
                            }}
                          >
                            @{u.username}
                          </p>
                          {u.bio && (
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.75rem',
                                color: '#7A6B72',
                                margin: '2px 0 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {u.bio}
                            </p>
                          )}
                        </div>

                        <FollowButton targetUserId={u.id} />
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
